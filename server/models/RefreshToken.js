const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    deviceInfo: {
        type: mongoose.Schema.Types.Mixed
    },
    expiresAt: {
        type: Date,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
