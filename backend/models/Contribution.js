const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: ["pending", "succeeded", "failed", "cancelled"],
        default: "pending"
    },
    provider: {
        type: String
    },
    providerPaymentId: {
        type: String,
        index: true
    },
    receiptUrl: {
        type: String
    },
    note: {
        type: String
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

contributionSchema.index({ providerPaymentId: 1 });
contributionSchema.index({ clubId: 1, userId: 1 });

module.exports = mongoose.model('Contribution', contributionSchema);
