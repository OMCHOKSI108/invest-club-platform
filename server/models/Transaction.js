const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["contribution", "buy", "sell", "payout", "fee", "adjustment"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    relatedModel: {
        type: String
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

transactionSchema.index({ clubId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
