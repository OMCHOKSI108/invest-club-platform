const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const Proposal = require('../models/Proposal');
const Vote = require('../models/Vote');
const ClubMember = require('../models/ClubMember');
const Club = require('../models/Club');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Create proposal
// POST /api/clubs/:clubId/proposals
// Creates a new investment proposal for club voting
// Body: { title, description, amount, assetType, assetSymbol, deadline, executionMethod }
// Response: { message: 'Proposal created successfully', proposal }
router.post('/:clubId/proposals', authenticateToken, [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('assetType').optional(),
    body('assetSymbol').optional(),
    body('deadline').isISO8601().withMessage('Valid deadline required'),
    body('description').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const club = await Club.findById(req.params.clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const { title, description, amount, assetType, assetSymbol, deadline, executionMethod } = req.body;

        // Calculate weight snapshot total
        const members = await ClubMember.find({ clubId: req.params.clubId });
        const weightSnapshotTotal = club.votingMode === 'weighted'
            ? members.reduce((sum, member) => sum + member.contributionAmount, 0)
            : members.length;

        const proposal = new Proposal({
            clubId: req.params.clubId,
            title,
            description,
            amount,
            assetType,
            assetSymbol,
            createdBy: req.user._id,
            deadline: new Date(deadline),
            executionMethod,
            weightSnapshotTotal
        });

        await proposal.save();

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'proposal_created',
            data: { proposalId: proposal._id, title, amount }
        });

        res.status(201).json({ message: 'Proposal created successfully', proposal });
    } catch (error) {
        console.error('Create proposal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get club proposals
// GET /api/clubs/:clubId/proposals
// Retrieves all proposals for the club (members only)
// Response: Array of proposals with creator details
router.get('/:clubId/proposals', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const proposals = await Proposal.find({ clubId: req.params.clubId })
            .populate('createdBy', 'firstName lastName username')
            .sort({ createdAt: -1 });

        res.json(proposals);
    } catch (error) {
        console.error('Get proposals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get proposal by ID
// GET /api/clubs/:clubId/proposals/:proposalId
// Retrieves detailed information about a specific proposal including votes
// Response: Proposal details with votes and user's vote status
router.get('/:clubId/proposals/:proposalId', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const proposal = await Proposal.findById(req.params.proposalId)
            .populate('createdBy', 'firstName lastName username');

        if (!proposal || proposal.clubId.toString() !== req.params.clubId) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        const votes = await Vote.find({ proposalId: req.params.proposalId })
            .populate('userId', 'firstName lastName username');

        const userVote = votes.find(vote => vote.userId._id.toString() === req.user._id.toString());

        res.json({
            ...proposal.toObject(),
            votes,
            userVote: userVote || null
        });
    } catch (error) {
        console.error('Get proposal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Vote on proposal
// POST /api/clubs/:clubId/proposals/:proposalId/vote
// Casts a vote on an active proposal (members only)
// Body: { vote: 'yes'|'no', comment }
// Response: { message: 'Vote cast successfully', vote }
router.post('/:clubId/proposals/:proposalId/vote', authenticateToken, [
    body('vote').isIn(['yes', 'no']).withMessage('Vote must be yes or no'),
    body('comment').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const proposal = await Proposal.findById(req.params.proposalId);
        if (!proposal || proposal.clubId.toString() !== req.params.clubId) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        if (proposal.status !== 'active') {
            return res.status(400).json({ message: 'Proposal is not active' });
        }

        if (new Date() > proposal.deadline) {
            return res.status(400).json({ message: 'Proposal deadline has passed' });
        }

        const existingVote = await Vote.findOne({ proposalId: req.params.proposalId, userId: req.user._id });
        if (existingVote) {
            return res.status(400).json({ message: 'Already voted on this proposal' });
        }

        const club = await Club.findById(req.params.clubId);
        const weight = club.votingMode === 'weighted' ? membership.contributionAmount : 1;

        const { vote, comment } = req.body;

        const voteDoc = new Vote({
            proposalId: req.params.proposalId,
            userId: req.user._id,
            vote,
            weight,
            comment
        });
        await voteDoc.save();

        // Update proposal aggregates
        const updateData = vote === 'yes'
            ? { $inc: { votesCount: 1, yesWeight: weight } }
            : { $inc: { votesCount: 1, noWeight: weight } };

        await Proposal.findByIdAndUpdate(req.params.proposalId, updateData);

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'vote_cast',
            data: { proposalId: req.params.proposalId, vote, weight }
        });

        res.json({ message: 'Vote cast successfully', vote: voteDoc });
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Close proposal
// POST /api/clubs/:clubId/proposals/:proposalId/close
// Closes an active proposal and determines approval based on votes (owner/admin only)
// Response: { message: 'Proposal approved/rejected', proposal }
router.post('/:clubId/proposals/:proposalId/close', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const proposal = await Proposal.findById(req.params.proposalId);
        if (!proposal || proposal.clubId.toString() !== req.params.clubId) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        if (proposal.status !== 'active') {
            return res.status(400).json({ message: 'Proposal is not active' });
        }

        const approvalPercentage = (proposal.yesWeight / proposal.weightSnapshotTotal) * 100;
        const club = await Club.findById(req.params.clubId);

        const newStatus = approvalPercentage >= club.approvalThresholdPercent ? 'approved' : 'rejected';

        proposal.status = newStatus;
        proposal.resolvedAt = new Date();
        await proposal.save();

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'proposal_resolved',
            data: { proposalId: req.params.proposalId, status: newStatus, approvalPercentage }
        });

        res.json({ message: `Proposal ${newStatus}`, proposal });
    } catch (error) {
        console.error('Close proposal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Execute approved proposal
// POST /api/clubs/:clubId/proposals/:proposalId/execute
// Executes an approved proposal by creating an order (owner/admin/treasurer only)
// Response: { message: 'Proposal execution started', proposal, order }
router.post('/:clubId/proposals/:proposalId/execute', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || !['owner', 'admin', 'treasurer'].includes(membership.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const proposal = await Proposal.findById(req.params.proposalId);
        if (!proposal || proposal.clubId.toString() !== req.params.clubId) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        if (proposal.status !== 'approved') {
            return res.status(400).json({ message: 'Proposal is not approved' });
        }

        // Create order for execution
        const Order = require('../models/Order');
        const order = new Order({
            clubId: req.params.clubId,
            createdBy: req.user._id,
            type: 'buy', // Assuming buy for investment proposals
            symbol: proposal.assetSymbol,
            quantity: Math.floor(proposal.amount / 100), // Simple calculation, adjust as needed
            status: 'pending'
        });
        await order.save();

        proposal.status = 'executed';
        await proposal.save();

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'proposal_executed',
            data: { proposalId: req.params.proposalId, orderId: order._id }
        });

        res.json({ message: 'Proposal execution started', proposal, order });
    } catch (error) {
        console.error('Execute proposal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
