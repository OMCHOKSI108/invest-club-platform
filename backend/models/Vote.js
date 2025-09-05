const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    proposalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    vote: {
        type: String,
        enum: ["yes", "no"],
        required: true
    },
    weight: {
        type: Number,
        default: 1
    },
    comment: {
        type: String
    }
}, {
    timestamps: true
});

voteSchema.index({ proposalId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
