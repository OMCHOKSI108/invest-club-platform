const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const File = require('../models/File');
const ClubMember = require('../models/ClubMember');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Upload file
router.post('/:clubId/files', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = new File({
            clubId: req.params.clubId,
            uploadedBy: req.user._id,
            filename: req.file.originalname,
            url: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size
        });

        await file.save();

        res.status(201).json({ message: 'File uploaded successfully', file });
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get club files
router.get('/:clubId/files', authenticateToken, async (req, res) => {
    try {
        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const files = await File.find({ clubId: req.params.clubId })
            .populate('uploadedBy', 'firstName lastName username')
            .sort({ createdAt: -1 });

        res.json(files);
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete file
router.delete('/:clubId/files/:fileId', authenticateToken, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file || file.clubId.toString() !== req.params.clubId) {
            return res.status(404).json({ message: 'File not found' });
        }

        const membership = await ClubMember.findOne({ clubId: req.params.clubId, userId: req.user._id });
        if (!membership || (file.uploadedBy.toString() !== req.user._id.toString() && !['owner', 'admin'].includes(membership.role))) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete file from filesystem
        const fs = require('fs');
        if (fs.existsSync(file.url)) {
            fs.unlinkSync(file.url);
        }

        await File.findByIdAndDelete(req.params.fileId);

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
