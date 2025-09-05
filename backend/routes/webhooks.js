const express = require('express');
const crypto = require('crypto');
const Contribution = require('../models/Contribution');
const Transaction = require('../models/Transaction');
const ClubMember = require('../models/ClubMember');
const WebhookEvent = require('../models/WebhookEvent');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Payment webhook (Razorpay/Stripe)
// POST /api/webhooks/payments/webhook
// Handles payment gateway webhooks for contribution processing
// Processes payment success events and updates contribution status
// Response: { status: 'processed' | 'already_processed' | 'contribution_not_found' }
router.post('/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'];
        const body = JSON.parse(req.body);

        // Store webhook event for deduplication
        const eventId = body.event?.id || body.id;
        const existingEvent = await WebhookEvent.findOne({
            provider: 'razorpay',
            providerEventId: eventId
        });

        if (existingEvent) {
            return res.json({ status: 'already_processed' });
        }

        const webhookEvent = new WebhookEvent({
            provider: 'razorpay',
            providerEventId: eventId,
            payload: body
        });
        await webhookEvent.save();

        // Process payment success
        if (body.event === 'payment.captured' || body.type === 'payment_intent.succeeded') {
            const paymentId = body.payload?.payment?.entity?.id || body.data?.object?.id;
            const amount = body.payload?.payment?.entity?.amount || body.data?.object?.amount;

            // Find contribution by payment ID
            const contribution = await Contribution.findOne({ providerPaymentId: paymentId });
            if (!contribution) {
                console.log('Contribution not found for payment:', paymentId);
                return res.status(200).json({ status: 'contribution_not_found' });
            }

            if (contribution.status === 'succeeded') {
                return res.json({ status: 'already_processed' });
            }

            // Update contribution status
            contribution.status = 'succeeded';
            await contribution.save();

            // Create transaction
            const transaction = new Transaction({
                clubId: contribution.clubId,
                type: 'contribution',
                amount: contribution.amount,
                currency: contribution.currency,
                relatedModel: 'Contribution',
                relatedId: contribution._id
            });
            await transaction.save();

            // Update member contribution amount
            await ClubMember.findByIdAndUpdate(contribution.userId, {
                $inc: { contributionAmount: contribution.amount }
            });

            // Audit log
            await AuditLog.create({
                clubId: contribution.clubId,
                userId: contribution.userId,
                eventType: 'contribution_succeeded',
                data: { contributionId: contribution._id, amount: contribution.amount, paymentId }
            });

            console.log('Payment processed successfully:', paymentId);
        }

        res.json({ status: 'processed' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ status: 'error', message: 'Webhook processing failed' });
    }
});

// Broker webhook (for order updates)
// POST /api/webhooks/broker/webhook
// Handles broker webhooks for order status updates
// Processes order fills and updates positions/transactions
// Response: { status: 'processed' | 'already_processed' | 'order_not_found' }
router.post('/broker/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const body = JSON.parse(req.body);

        // Store webhook event
        const eventId = body.orderId || body.id;
        const existingEvent = await WebhookEvent.findOne({
            provider: 'broker',
            providerEventId: eventId
        });

        if (existingEvent) {
            return res.json({ status: 'already_processed' });
        }

        const webhookEvent = new WebhookEvent({
            provider: 'broker',
            providerEventId: eventId,
            payload: body
        });
        await webhookEvent.save();

        // Process order updates
        const Order = require('../models/Order');
        const Position = require('../models/Position');

        const order = await Order.findOne({ brokerOrderId: eventId });
        if (!order) {
            console.log('Order not found for broker update:', eventId);
            return res.status(200).json({ status: 'order_not_found' });
        }

        // Update order status
        if (body.status === 'filled') {
            order.status = 'filled';
            order.filledQuantity = body.filledQuantity || order.quantity;
            await order.save();

            // Update or create position
            const position = await Position.findOne({ clubId: order.clubId, symbol: order.symbol });
            if (position) {
                if (order.type === 'buy') {
                    const totalValue = position.quantity * position.avgPrice + order.quantity * body.avgPrice;
                    position.quantity += order.quantity;
                    position.avgPrice = totalValue / position.quantity;
                } else {
                    position.quantity -= order.quantity;
                }
                await position.save();
            } else if (order.type === 'buy') {
                const newPosition = new Position({
                    clubId: order.clubId,
                    symbol: order.symbol,
                    quantity: order.quantity,
                    avgPrice: body.avgPrice,
                    lastPrice: body.avgPrice
                });
                await newPosition.save();
            }

            // Create transaction
            const transaction = new Transaction({
                clubId: order.clubId,
                type: order.type,
                amount: order.quantity * body.avgPrice,
                currency: 'INR',
                relatedModel: 'Order',
                relatedId: order._id
            });
            await transaction.save();

            // Audit log
            await AuditLog.create({
                clubId: order.clubId,
                userId: order.createdBy,
                eventType: 'order_filled',
                data: { orderId: order._id, symbol: order.symbol, quantity: order.quantity }
            });
        }

        res.json({ status: 'processed' });
    } catch (error) {
        console.error('Broker webhook processing error:', error);
        res.status(500).json({ status: 'error', message: 'Webhook processing failed' });
    }
});

// Market data webhook
// POST /api/webhooks/market/webhook
// Handles market data webhooks for price updates
// Updates position prices and triggers price alerts
// Response: { status: 'processed' }
router.post('/market/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const body = JSON.parse(req.body);

        // Store webhook event
        const eventId = body.symbol + '_' + Date.now();
        const webhookEvent = new WebhookEvent({
            provider: 'market',
            providerEventId: eventId,
            payload: body
        });
        await webhookEvent.save();

        // Update position prices
        const Position = require('../models/Position');
        const PriceAlert = require('../models/PriceAlert');
        const Notification = require('../models/Notification');

        if (body.symbol && body.price) {
            // Update positions
            await Position.updateMany(
                { symbol: body.symbol },
                { lastPrice: body.price }
            );

            // Check price alerts
            const alerts = await PriceAlert.find({
                symbol: body.symbol,
                enabled: true
            });

            for (const alert of alerts) {
                let triggered = false;
                if (alert.conditionType === 'gte' && body.price >= alert.price) {
                    triggered = true;
                } else if (alert.conditionType === 'lte' && body.price <= alert.price) {
                    triggered = true;
                }

                if (triggered) {
                    // Create notification
                    await Notification.create({
                        userId: alert.createdBy,
                        clubId: alert.clubId,
                        type: 'price_alert',
                        title: `Price Alert: ${body.symbol}`,
                        body: `${body.symbol} has reached ${body.price}`,
                        data: { symbol: body.symbol, price: body.price, alertId: alert._id }
                    });

                    // Optionally disable alert after trigger
                    alert.enabled = false;
                    await alert.save();
                }
            }
        }

        res.json({ status: 'processed' });
    } catch (error) {
        console.error('Market webhook processing error:', error);
        res.status(500).json({ status: 'error', message: 'Webhook processing failed' });
    }
});

module.exports = router;
