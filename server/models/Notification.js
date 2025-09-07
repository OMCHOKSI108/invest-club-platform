const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        index: true
    },
    type: {
        type: String
    },
    title: {
        type: String
    },
    body: {
        type: String
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
