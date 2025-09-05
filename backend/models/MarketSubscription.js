const mongoose = require('mongoose');

const marketSubscriptionSchema = new mongoose.Schema({
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    lastFetchedAt: {
        type: Date
    }
}, {
    timestamps: true
});

marketSubscriptionSchema.index({ symbol: 1 });
marketSubscriptionSchema.index({ clubId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('MarketSubscription', marketSubscriptionSchema);
