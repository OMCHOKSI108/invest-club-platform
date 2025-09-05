const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        default: ""
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    minContribution: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: "INR"
    },
    votingMode: {
        type: String,
        enum: ["simple", "weighted"],
        default: "simple"
    },
    approvalThresholdPercent: {
        type: Number,
        default: 50
    },
    votingPeriodDays: {
        type: Number,
        default: 7
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    settings: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

clubSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Club', clubSchema);
