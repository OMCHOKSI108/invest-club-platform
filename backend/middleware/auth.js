const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token - user not found' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Account not verified' });
        }

        req.user = user; // Add user to request object
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
};

// Optional middleware - allows both authenticated and unauthenticated access
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (user && user.isVerified) {
            req.user = user;
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null;
    }

    next();
};

module.exports = {
    authenticateToken,
    optionalAuth
};
