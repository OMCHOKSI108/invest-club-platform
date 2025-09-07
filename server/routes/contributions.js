const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const Contribution = require('../models/Contribution');
const ClubMember = require('../models/ClubMember');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Create contribution
// POST /api/clubs/:clubId/contributions
// Creates a new contribution request for the authenticated user
// Body: { amount, currency, note }
// Response: { message: 'Contribution created successfully', contribution }
router.post('/:clubId/contributions', authenticateToken, [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional(),
    body('note').optional()
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

        const { amount, currency, note } = req.body;

        const contribution = new Contribution({
            clubId: req.params.clubId,
            userId: req.user._id,
            amount,
            currency,
            note,
            status: 'pending'
        });

        await contribution.save();

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'contribution_created',
            data: { contributionId: contribution._id, amount, currency }
        });

        res.status(201).json({ message: 'Contribution created successfully', contribution });
    } catch (error) {
        console.error('Create contribution error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get club contributions
// GET /api/clubs/:clubId/contributions
// Retrieves all contributions for a club (members only)
// Response: Array of contributions with user and approver details
router.get('/:clubId/contributions', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const contributions = await Contribution.find({ clubId: req.params.clubId })
            .populate('userId', 'firstName lastName username')
            .populate('approvedBy', 'firstName lastName username')
            .sort({ createdAt: -1 });

        res.json(contributions);
    } catch (error) {
        console.error('Get contributions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create manual contribution (treasurer/admin only)
// POST /api/clubs/:clubId/contributions/manual
// Creates a contribution entry for another user (treasurer/admin/owner only)
// Body: { userId, amount, currency, note }
// Response: { message: 'Manual contribution created successfully', contribution }
router.post('/:clubId/contributions/manual', authenticateToken, [
    body('userId').isMongoId().withMessage('Valid user ID required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional(),
    body('note').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || !['owner', 'admin', 'treasurer'].includes(membership.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const targetMembership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.body.userId });
        if (!targetMembership) {
            return res.status(404).json({ message: 'User is not a member of this club' });
        }

        const { userId, amount, currency, note } = req.body;

        const contribution = new Contribution({
            clubId: req.params.clubId,
            userId,
            amount,
            currency,
            note,
            provider: 'MANUAL',
            status: 'pending',
            approvedBy: req.user._id
        });

        await contribution.save();

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'manual_contribution_created',
            data: { contributionId: contribution._id, targetUserId: userId, amount, currency }
        });

        res.status(201).json({ message: 'Manual contribution created successfully', contribution });
    } catch (error) {
        console.error('Create manual contribution error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve manual contribution
// PUT /api/clubs/:clubId/contributions/:contributionId/approve
// Approves a pending manual contribution and creates transaction (treasurer/admin/owner only)
// Response: { message: 'Contribution approved successfully', contribution, transaction }
router.put('/:clubId/contributions/:contributionId/approve', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || !['owner', 'admin', 'treasurer'].includes(membership.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const contribution = await Contribution.findById(req.params.contributionId);
        if (!contribution || contribution.clubId.toString() !== req.params.clubId) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        if (contribution.status !== 'pending') {
            return res.status(400).json({ message: 'Contribution already processed' });
        }

        // Update contribution status
        contribution.status = 'succeeded';
        contribution.approvedBy = req.user._id;
        await contribution.save();

        // Create transaction
        const transaction = new Transaction({
            clubId: req.params.clubId,
            type: 'contribution',
            amount: contribution.amount,
            currency: contribution.currency,
            relatedModel: 'Contribution',
            relatedId: contribution._id,
            createdBy: req.user._id
        });
        await transaction.save();

        // Update member contribution amount
        await ClubMember.findByIdAndUpdate(contribution.userId, {
            $inc: { contributionAmount: contribution.amount }
        });

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'contribution_approved',
            data: { contributionId: contribution._id, amount: contribution.amount }
        });

        res.json({ message: 'Contribution approved successfully', contribution, transaction });
    } catch (error) {
        console.error('Approve contribution error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
