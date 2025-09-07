const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ["owner", "admin", "treasurer", "member"],
        default: "member"
    },
    contributionAmount: {
        type: Number,
        default: 0
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    sharePercentSnapshot: {
        type: Number,
        default: 0
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

clubMemberSchema.index({ clubId: 1, userId: 1 }, { unique: true });
clubMemberSchema.index({ userId: 1 });

module.exports = mongoose.model('ClubMember', clubMemberSchema);
