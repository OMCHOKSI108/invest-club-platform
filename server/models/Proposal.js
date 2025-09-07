const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    amount: {
        type: Number,
        required: true
    },
    assetType: {
        type: String,
        enum: ["stock", "mf", "crypto", "bond", "other"],
        default: "stock"
    },
    assetSymbol: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    deadline: {
        type: Date,
        required: true,
        index: true
    },
    executionMethod: {
        type: String,
        enum: ["manual", "auto"],
        default: "manual"
    },
    status: {
        type: String,
        enum: ["active", "approved", "rejected", "executed", "cancelled"],
        default: "active",
        index: true
    },
    votesCount: {
        type: Number,
        default: 0
    },
    yesWeight: {
        type: Number,
        default: 0
    },
    noWeight: {
        type: Number,
        default: 0
    },
    weightSnapshotTotal: {
        type: Number,
        default: 0
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

proposalSchema.index({ clubId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Proposal', proposalSchema);
