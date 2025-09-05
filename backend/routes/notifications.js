const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Get user notifications
// GET /api/notifications/
// Retrieves all notifications for the authenticated user (latest 50)
// Response: Array of notifications with club details
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .populate('clubId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark notification as read
// PUT /api/notifications/:notificationId/read
// Marks a specific notification as read (owner only)
// Response: { message: 'Notification marked as read' }
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.notificationId);
        if (!notification || notification.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark all notifications as read
// POST /api/notifications/mark-read
// Marks all unread notifications as read for the authenticated user
// Response: { message: 'All notifications marked as read' }
router.post('/mark-read', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete notification
// DELETE /api/notifications/:notificationId
// Deletes a specific notification (owner only)
// Response: { message: 'Notification deleted successfully' }
router.delete('/:notificationId', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.notificationId);
        if (!notification || notification.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await Notification.findByIdAndDelete(req.params.notificationId);

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create notification (internal use)
// POST /api/notifications/create
// Creates a new notification (typically called internally by other endpoints)
// Body: { userId, clubId, type, title, body, data }
// Response: { message: 'Notification created successfully', notification }
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { userId, clubId, type, title, body, data } = req.body;

        const notification = new Notification({
            userId,
            clubId,
            type,
            title,
            body,
            data
        });

        await notification.save();

        res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
