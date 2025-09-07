const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["buy", "sell"],
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    orderType: {
        type: String,
        enum: ["market", "limit"],
        default: "market"
    },
    limitPrice: {
        type: Number
    },
    status: {
        type: String,
        enum: ["pending", "placed", "partial", "filled", "cancelled", "failed"],
        default: "pending"
    },
    brokerOrderId: {
        type: String,
        index: true
    },
    filledQuantity: {
        type: Number,
        default: 0
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

orderSchema.index({ brokerOrderId: 1 });

module.exports = mongoose.model('Order', orderSchema);
