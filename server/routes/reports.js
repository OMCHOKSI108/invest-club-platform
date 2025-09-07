const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ReportJob = require('../models/ReportJob');
const ClubMember = require('../models/ClubMember');

const router = express.Router();

// Generate report
// POST /api/clubs/:clubId/reports/generate
// Initiates generation of a report for the club (members only)
// Body: { type, params }
// Response: { message: 'Report generation started', job }
router.post('/:clubId/reports/generate', authenticateToken, [
    require('express-validator').body('type').notEmpty().withMessage('Report type is required'),
    require('express-validator').body('params').optional()
], async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });   
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { type, params } = req.body;

        const job = new ReportJob({
            clubId: req.params.clubId,
            type,
            params: params || {}
        });

        await job.save();

        // In a real implementation, you'd queue this job for background processing
        // For now, we'll simulate immediate completion
        setTimeout(async () => {
            job.status = 'done';
            job.resultUrl = `/reports/${job._id}.pdf`; // Mock URL
            await job.save();   
        }, 2000);

        res.status(201).json({ message: 'Report generation started', job });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get report job status
// GET /api/reports/jobs/:jobId
// Retrieves the status of a report generation job (club members only)
// Response: Report job details with status and result URL
router.get('/reports/jobs/:jobId', authenticateToken, async (req, res) => {
    try {
        const job = await ReportJob.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Report job not found' });
        }

        // Check if user has access to this club's reports
        const membership = await ClubMember.findOne({ clubId: job.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(job);
    } catch (error) {
        console.error('Get report job error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get club report jobs
// GET /api/clubs/:clubId/reports/jobs
// Retrieves all report generation jobs for the club (members only)
// Response: Array of report jobs
router.get('/:clubId/reports/jobs', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const jobs = await ReportJob.find({ clubId: req.params.clubId })
            .sort({ createdAt: -1 });

        res.json(jobs);
    } catch (error) {
        console.error('Get report jobs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
