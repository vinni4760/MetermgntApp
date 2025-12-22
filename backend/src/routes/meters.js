const express = require('express');
const Meter = require('../models/Meter');
const Vendor = require('../models/Vendor');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all meters
router.get('/', protect, async (req, res) => {
    try {
        const meters = await Meter.find().populate('vendorId');

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

// Get all vendors
router.get('/vendors', protect, async (req, res) => {
    try {
        const vendors = await Vendor.find();

        res.json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    } catch (error) {
        console.error('Get vendors error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
