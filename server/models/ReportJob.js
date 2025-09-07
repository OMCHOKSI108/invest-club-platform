const mongoose = require('mongoose');

const reportJobSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club"
    },
    type: {
        type: String
    },
    params: {
        type: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ["queued", "running", "done", "failed"],
        default: "queued"
    },
    resultUrl: {
        type: String
    },
    error: {
        type: String
    }
}, {
    timestamps: true
});

reportJobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ReportJob', reportJobSchema);
