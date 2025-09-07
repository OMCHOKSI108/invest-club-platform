const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
        index: true
    },
    symbol: {
        type: String,
        required: true
    },
    conditionType: {
        type: String,
        enum: ["gte", "lte"],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    notifyChannels: {
        type: [String],
        default: ["chat", "email"]
    },
    enabled: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

priceAlertSchema.index({ symbol: 1, enabled: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
