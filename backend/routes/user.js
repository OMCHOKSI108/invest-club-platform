const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile (protected route)
// GET /api/user/profile
// Retrieves the authenticated user's profile information
// Response: User profile data (excluding sensitive fields)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile (protected route)
// PUT /api/user/profile
// Updates the authenticated user's profile information
// Body: { firstName, lastName, number }
// Response: { message: 'Profile updated successfully', user }
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, number } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { firstName, lastName, number },
            { new: true, select: '-password -otp -otpExpires' }
        );

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password (protected route)
// PUT /api/user/change-password
// Changes the authenticated user's password
// Body: { currentPassword, newPassword }
// Response: { message: 'Password changed successfully' }
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        const user = await User.findById(req.user._id);

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
