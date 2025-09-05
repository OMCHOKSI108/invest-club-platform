const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const Club = require('../models/Club');
const ClubMember = require('../models/ClubMember');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Create a new club
// POST /api/clubs/
// Creates a new investment club with the authenticated user as owner
// Body: { name, description, minContribution, currency, votingMode, approvalThresholdPercent, votingPeriodDays, isPublic, settings }
// Response: { message: 'Club created successfully', club }
router.post('/', authenticateToken, [
    body('name').notEmpty().withMessage('Club name is required'),
    body('description').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, minContribution, currency, votingMode, approvalThresholdPercent, votingPeriodDays, isPublic, settings } = req.body;

        const club = new Club({
            name,
            description,
            ownerId: req.user._id,
            minContribution,
            currency,
            votingMode,
            approvalThresholdPercent,
            votingPeriodDays,
            isPublic,
            settings
        });

        await club.save();

        // Create owner membership
        const clubMember = new ClubMember({
            clubId: club._id,
            userId: req.user._id,
            role: 'owner'
        });
        await clubMember.save();

        // Audit log
        await AuditLog.create({
            clubId: club._id,
            userId: req.user._id,
            eventType: 'club_created',
            data: { clubId: club._id, name: club.name }
        });

        res.status(201).json({ message: 'Club created successfully', club });
    } catch (error) {
        console.error('Create club error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all clubs (with membership info for authenticated user)
// GET /api/clubs/
// Retrieves all clubs with membership status for the current user
// Response: Array of clubs with membership details
router.get('/', authenticateToken, async (req, res) => {
    try {
        const clubs = await Club.find({}).populate('ownerId', 'firstName lastName username');
        const clubMemberships = await ClubMember.find({ userId: req.user._id });

        const clubsWithMembership = clubs.map(club => {
            const membership = clubMemberships.find(m => m.clubId.toString() === club._id.toString());
            return {
                ...club.toObject(),
                membership: membership ? {
                    role: membership.role,
                    contributionAmount: membership.contributionAmount,
                    joinDate: membership.joinDate
                } : null
            };
        });

        res.json(clubsWithMembership);
    } catch (error) {
        console.error('Get clubs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get club by ID
// GET /api/clubs/:clubId
// Retrieves detailed information about a specific club
// Response: Club details with membership info and member count
router.get('/:clubId', authenticateToken, async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId).populate('ownerId', 'firstName lastName username');
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!club.isPublic && !membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const memberCount = await ClubMember.countDocuments({ clubId: req.params.clubId });

        res.json({
            ...club.toObject(),
            membership: membership ? {
                role: membership.role,
                contributionAmount: membership.contributionAmount,
                joinDate: membership.joinDate
            } : null,
            memberCount
        });
    } catch (error) {
        console.error('Get club error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update club
// PUT /api/clubs/:clubId
// Updates club settings (owner/admin only)
// Body: { name, description, minContribution, currency, votingMode, approvalThresholdPercent, votingPeriodDays, isPublic, settings }
// Response: { message: 'Club updated successfully', club }
router.put('/:clubId', authenticateToken, async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const allowedFields = ['name', 'description', 'minContribution', 'currency', 'votingMode', 'approvalThresholdPercent', 'votingPeriodDays', 'isPublic', 'settings'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedClub = await Club.findByIdAndUpdate(req.params.clubId, updates, { new: true });

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'club_updated',
            data: updates
        });

        res.json({ message: 'Club updated successfully', club: updatedClub });
    } catch (error) {
        console.error('Update club error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete club
// DELETE /api/clubs/:clubId
// Soft deletes a club (owner only)
// Response: { message: 'Club deleted successfully' }
router.delete('/:clubId', authenticateToken, async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || membership.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Soft delete - mark as deleted in settings
        await Club.findByIdAndUpdate(req.params.clubId, {
            settings: { ...club.settings, deleted: true, deletedAt: new Date() }
        });

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'club_deleted',
            data: { clubId: req.params.clubId }
        });

        res.json({ message: 'Club deleted successfully' });
    } catch (error) {
        console.error('Delete club error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Join club
// POST /api/clubs/:clubId/join
// Allows user to join a public club
// Response: { message: 'Joined club successfully', membership }
router.post('/:clubId/join', authenticateToken, async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (!club.isPublic) {
            return res.status(403).json({ message: 'Club is private' });
        }

        const existingMembership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (existingMembership) {
            return res.status(400).json({ message: 'Already a member' });
        }

        const clubMember = new ClubMember({
            clubId: req.params.clubId,
            userId: req.user._id,
            role: 'member'
        });
        await clubMember.save();

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'member_joined',
            data: { clubId: req.params.clubId, userId: req.user._id }
        });

        res.json({ message: 'Joined club successfully', membership: clubMember });
    } catch (error) {
        console.error('Join club error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get club members
// GET /api/clubs/:clubId/members
// Retrieves all members of a club (members only)
// Response: Array of club members with user details
router.get('/:clubId/members', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const members = await ClubMember.find({ clubId: req.params.clubId })
            .populate('userId', 'firstName lastName username email')
            .sort({ joinDate: 1 });

        res.json(members);
    } catch (error) {
        console.error('Get club members error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update member role
// PUT /api/clubs/:clubId/members/:userId
// Updates a member's role in the club (owner/admin only)
// Body: { role: 'owner' | 'admin' | 'treasurer' | 'member' }
// Response: { message: 'Member role updated successfully', membership }
router.put('/:clubId/members/:userId', authenticateToken, async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const targetMembership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.params.userId });
        if (!targetMembership) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const { role } = req.body;
        if (!['owner', 'admin', 'treasurer', 'member'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        targetMembership.role = role;
        await targetMembership.save();

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'member_role_updated',
            data: { targetUserId: req.params.userId, newRole: role }
        });

        res.json({ message: 'Member role updated successfully', membership: targetMembership });
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove member
// DELETE /api/clubs/:clubId/members/:userId
// Removes a member from the club (owner/admin only)
// Response: { message: 'Member removed successfully' }
router.delete('/:clubId/members/:userId', authenticateToken, async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const targetMembership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.params.userId });
        if (!targetMembership) {
            return res.status(404).json({ message: 'Member not found' });
        }

        await ClubMember.findByIdAndDelete(targetMembership._id);

        // Audit log
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'member_removed',
            data: { targetUserId: req.params.userId }
        });

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
