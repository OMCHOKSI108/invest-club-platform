const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    eventType: {
        type: String
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    immutable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

auditLogSchema.index({ clubId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
