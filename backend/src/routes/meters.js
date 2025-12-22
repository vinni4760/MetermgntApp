const express = require('express');
const Meter = require('../models/Meter');
const Vendor = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all meters (all authenticated users)
router.get('/', protect, async (req, res) => {
    try {
        const meters = await Meter.find()
            .populate('vendorId', 'name')
            .populate('assignedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: meters.length,
            data: meters
        });
    } catch (error) {
        console.error('Get meters error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Get meters statistics
router.get('/stats', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const totalMeters = await Meter.countDocuments();
        const availableMeters = await Meter.countDocuments({ status: 'AVAILABLE' });
        const installedMeters = await Meter.countDocuments({ status: 'INSTALLED' });
        const vendorCount = await Vendor.countDocuments();

        res.json({
            success: true,
            data: {
                totalMeters,
                availableMeters,
                installedMeters,
                vendorCount
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Assign meters to vendor (admin only)
router.post('/assign', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { vendorId, quantity } = req.body;

        if (!vendorId || !quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Vendor ID and valid quantity are required'
            });
        }

        // Verify vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        // Get last meter serial number
        const lastMeter = await Meter.findOne().sort({ serialNumber: -1 });
        let nextNumber = 1;

        if (lastMeter && lastMeter.serialNumber) {
            const match = lastMeter.serialNumber.match(/MTR-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        // Create meters
        const meters = [];
        for (let i = 0; i < quantity; i++) {
            const serialNumber = `MTR-${String(nextNumber + i).padStart(5, '0')}`;
            meters.push({
                serialNumber,
                vendorId,
                assignedBy: req.user._id,
                status: 'AVAILABLE'
            });
        }

        const createdMeters = await Meter.insertMany(meters);

        // Update vendor's meter count
        await Vendor.findByIdAndUpdate(vendorId, {
            $inc: { assignedMetersCount: quantity }
        });

        res.status(201).json({
            success: true,
            data: {
                assigned: createdMeters.length,
                meters: createdMeters
            }
        });
    } catch (error) {
        console.error('Assign meters error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to assign meters'
        });
    }
});

// Get meters for a specific vendor
router.get('/vendor/:vendorId', protect, async (req, res) => {
    try {
        const meters = await Meter.find({ vendorId: req.params.vendorId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: meters.length,
            data: meters
        });
    } catch (error) {
        console.error('Get vendor meters error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
