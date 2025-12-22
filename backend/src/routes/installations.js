const express = require('express');
const Installation = require('../models/Installation');
const Meter = require('../models/Meter');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all installations
router.get('/', protect, async (req, res) => {
    try {
        const installations = await Installation.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: installations.length,
            data: installations
        });
    } catch (error) {
        console.error('Get installations error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Create new installation
router.post('/', protect, async (req, res) => {
    try {
        const installation = await Installation.create(req.body);

        // Update meter status to INSTALLED
        if (installation.meterSerialNumber) {
            await Meter.findOneAndUpdate(
                { serialNumber: installation.meterSerialNumber },
                {
                    status: 'INSTALLED',
                    installationId: installation._id
                }
            );
        }

        res.status(201).json({
            success: true,
            data: installation
        });
    } catch (error) {
        console.error('Create installation error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create installation'
        });
    }
});

module.exports = router;
