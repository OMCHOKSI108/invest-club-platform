const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    },
    documents: [{
        filename: String,
        url: String,
        type: String
    }],
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviewedAt: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

kycSchema.index({ userId: 1 });

module.exports = mongoose.model('Kyc', kycSchema);
