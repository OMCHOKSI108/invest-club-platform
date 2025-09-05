const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOTP, sendTempPassword } = require('../utils/email');

const router = express.Router();

// Generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Signup
router.post('/signup', [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('number').notEmpty().withMessage('Number is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, username, number, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = new User({
            firstName,
            lastName,
            username,
            number,
            email,
            password,
            otp,
            otpExpires
        });

        await user.save();
        await sendOTP(email, otp);

        res.status(201).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Signup OTP
router.post('/verify-signup', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').notEmpty().withMessage('OTP is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.json({ message: 'Signup successful', token });
    } catch (error) {
        console.error('Verify-signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', [
    body('identifier').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Account not verified' });
        }

        // Generate JWT token directly after password verification
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Account not verified' });
        }

        // Generate new temporary password (8 characters)
        const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase();

        // Save the temporary password
        user.password = tempPassword;
        await user.save();

        // Send temporary password via email
        await sendTempPassword(email, tempPassword);

        res.json({ message: 'Temporary password sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

// Test email endpoint (dev helper)
// POST /api/auth/test-email { "email": "you@example.com" }
// Sends an OTP (or logs it when SMTP is not available).
router.post('/test-email', async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'email is required' });

    try {
        const otp = generateOTP();
        // sendOTP will either send or log depending on transporter state
        await sendOTP(email, otp);
        return res.json({ message: 'Test OTP processed', email, otp: process.env.NODE_ENV === 'production' ? undefined : otp });
    } catch (err) {
        console.error('Test-email error:', err);
        return res.status(500).json({ message: 'Failed to process test OTP', error: err.message });
    }
});
