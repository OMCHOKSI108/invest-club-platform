const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
    provider: {
        type: String
    },
    providerEventId: {
        type: String,
        index: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed
    },
    processed: {
        type: Boolean,
        default: false
    },
    processedAt: {
        type: Date
    }
}, {
    timestamps: true
});

webhookEventSchema.index({ provider: 1, providerEventId: 1 }, { unique: true });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
