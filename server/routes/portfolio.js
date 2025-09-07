const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Position = require('../models/Position');
const Order = require('../models/Order');
const ClubMember = require('../models/ClubMember');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Get club portfolio
// GET /api/clubs/:clubId/portfolio
// Retrieves portfolio overview including positions, recent transactions, and summary
// Response: { positions, transactions, summary: { totalValue, positionCount, transactionCount } }
router.get('/:clubId/portfolio', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const positions = await Position.find({ clubId: req.params.clubId });
        const transactions = await Transaction.find({ clubId: req.params.clubId })
            .sort({ createdAt: -1 })
            .limit(50);

        const totalValue = positions.reduce((sum, position) => {
            return sum + (position.quantity * (position.lastPrice || position.avgPrice));
        }, 0);

        res.json({
            positions,
            transactions,
            summary: {
                totalValue,
                positionCount: positions.length,
                transactionCount: transactions.length
            }
        });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get positions
// GET /api/clubs/:clubId/positions
// Retrieves all investment positions for the club (members only)
// Response: Array of positions
router.get('/:clubId/positions', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const positions = await Position.find({ clubId: req.params.clubId });
        res.json(positions);
    } catch (error) {
        console.error('Get positions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create order
// POST /api/clubs/:clubId/orders
// Creates a new buy/sell order for the club portfolio
// Body: { type: 'buy'|'sell', symbol, quantity, orderType: 'market'|'limit', limitPrice }
// Response: { message: 'Order created successfully', order }
router.post('/:clubId/orders', authenticateToken, [
    require('express-validator').body('type').isIn(['buy', 'sell']).withMessage('Type must be buy or sell'),
    require('express-validator').body('symbol').notEmpty().withMessage('Symbol is required'),
    require('express-validator').body('quantity').isNumeric().withMessage('Quantity must be a number'),
    require('express-validator').body('orderType').optional().isIn(['market', 'limit']),
    require('express-validator').body('limitPrice').optional().isNumeric()
], async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { type, symbol, quantity, orderType, limitPrice } = req.body;

        const order = new Order({
            clubId: req.params.clubId,
            createdBy: req.user._id,
            type,
            symbol,
            quantity,
            orderType,
            limitPrice
        });

        await order.save();

        // Audit log
        const AuditLog = require('../models/AuditLog');
        await AuditLog.create({
            clubId: req.params.clubId,
            userId: req.user._id,
            eventType: 'order_created',
            data: { orderId: order._id, type, symbol, quantity }
        });

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get orders
// GET /api/clubs/:clubId/orders
// Retrieves all orders for the club (members only)
// Response: Array of orders with creator details
router.get('/:clubId/orders', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const orders = await Order.find({ clubId: req.params.clubId })
            .populate('createdBy', 'firstName lastName username')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get transactions
// GET /api/clubs/:clubId/transactions
// Retrieves all financial transactions for the club (members only)
// Response: Array of transactions with creator details
router.get('/:clubId/transactions', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const transactions = await Transaction.find({ clubId: req.params.clubId })
            .populate('createdBy', 'firstName lastName username')
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get audit logs
// GET /api/clubs/:clubId/audit-logs
// Retrieves audit logs for the club (members only, latest 100)
// Response: Array of audit logs with user details
router.get('/:clubId/audit-logs', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const auditLogs = await require('../models/AuditLog').find({ clubId: req.params.clubId })
            .populate('userId', 'firstName lastName username')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(auditLogs);
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
