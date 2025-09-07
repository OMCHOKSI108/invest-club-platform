const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
        index: true
    },
    symbol: {
        type: String,
        required: true,
        index: true
    },
    quantity: {
        type: Number,
        required: true
    },
    avgPrice: {
        type: Number,
        required: true
    },
    lastPrice: {
        type: Number
    },
    currency: {
        type: String,
        default: "INR"
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

positionSchema.index({ clubId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Position', positionSchema);
