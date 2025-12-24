const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Upload images to Cloudinary
router.post('/', protect, upload.array('photos', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'meter-installations',
                        resource_type: 'image',
                        transformation: [
                            { width: 1200, height: 1200, crop: 'limit' },
                            { quality: 'auto:good' }
                        ]
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );

                uploadStream.end(file.buffer);
            });
        });

        const imageUrls = await Promise.all(uploadPromises);

        res.json({
            success: true,
            data: imageUrls,
            count: imageUrls.length
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload images'
        });
    }
});

module.exports = router;
