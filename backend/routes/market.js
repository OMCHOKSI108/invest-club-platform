const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const MarketSubscription = require('../models/MarketSubscription');
const PriceAlert = require('../models/PriceAlert');
const ClubMember = require('../models/ClubMember');

const router = express.Router();

// Subscribe to market data
router.post('/subscribe', authenticateToken, [
    require('express-validator').body('clubId').isMongoId().withMessage('Valid club ID required'),
    require('express-validator').body('symbol').notEmpty().withMessage('Symbol is required')
], async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const membership = await ClubMember.findOne({ clubId: req.body.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { clubId, symbol } = req.body;

        const subscription = new MarketSubscription({
            clubId,
            symbol,
            createdBy: req.user._id
        });

        await subscription.save();

        res.status(201).json({ message: 'Market subscription created successfully', subscription });
    } catch (error) {
        console.error('Create market subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Unsubscribe from market data
router.post('/unsubscribe', authenticateToken, [
    require('express-validator').body('clubId').isMongoId().withMessage('Valid club ID required'),
    require('express-validator').body('symbol').notEmpty().withMessage('Symbol is required')
], async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.body.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { clubId, symbol } = req.body;

        await MarketSubscription.findOneAndDelete({ clubId, symbol });

        res.json({ message: 'Market subscription removed successfully' });
    } catch (error) {
        console.error('Remove market subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get market subscriptions
router.get('/subscriptions', authenticateToken, async (req, res) => {
    try {
        const subscriptions = await MarketSubscription.find({ createdBy: req.user._id })
            .populate('clubId', 'name');

        res.json(subscriptions);
    } catch (error) {
        console.error('Get market subscriptions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create price alert
router.post('/price-alert', authenticateToken, [
    require('express-validator').body('clubId').isMongoId().withMessage('Valid club ID required'),
    require('express-validator').body('symbol').notEmpty().withMessage('Symbol is required'),
    require('express-validator').body('conditionType').isIn(['gte', 'lte']).withMessage('Condition type must be gte or lte'),
    require('express-validator').body('price').isNumeric().withMessage('Price must be a number')
], async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const membership = await ClubMember.findOne({ clubId: req.body.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { clubId, symbol, conditionType, price, notifyChannels } = req.body;

        const alert = new PriceAlert({
            clubId,
            symbol,
            conditionType,
            price,
            notifyChannels,
            createdBy: req.user._id
        });

        await alert.save();

        res.status(201).json({ message: 'Price alert created successfully', alert });
    } catch (error) {
        console.error('Create price alert error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get price alerts
router.get('/price-alerts/:clubId', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const alerts = await PriceAlert.find({ clubId: req.params.clubId, enabled: true });
        res.json(alerts);
    } catch (error) {
        console.error('Get price alerts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update price alert
router.put('/price-alert/:alertId', authenticateToken, async (req, res) => {
    try {
        const alert = await PriceAlert.findById(req.params.alertId);
        if (!alert) {
            return res.status(404).json({ message: 'Price alert not found' });
        }

        const membership = await ClubMember.findOne({ clubId: alert.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const allowedFields = ['conditionType', 'price', 'notifyChannels', 'enabled'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedAlert = await PriceAlert.findByIdAndUpdate(req.params.alertId, updates, { new: true });

        res.json({ message: 'Price alert updated successfully', alert: updatedAlert });
    } catch (error) {
        console.error('Update price alert error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete price alert
router.delete('/price-alert/:alertId', authenticateToken, async (req, res) => {
    try {
        const alert = await PriceAlert.findById(req.params.alertId);
        if (!alert) {
            return res.status(404).json({ message: 'Price alert not found' });
        }

        const membership = await ClubMember.findOne({ clubId: alert.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await PriceAlert.findByIdAndDelete(req.params.alertId);

        res.json({ message: 'Price alert deleted successfully' });
    } catch (error) {
        console.error('Delete price alert error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
