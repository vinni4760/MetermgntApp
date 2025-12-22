const express = require('express');
const Vendor = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all vendors
router.get('/', protect, async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ name: 1 });
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

// Create vendor (admin only)
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body);

        res.status(201).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        console.error('Create vendor error:', error);

        // Handle duplicate name error
        if (error.code === 11000 && error.keyPattern?.name) {
            return res.status(400).json({
                success: false,
                error: `Vendor "${req.body.name}" already exists. Please choose a different name.`
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                error: messages.join('. ')
            });
        }

        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create vendor'
        });
    }
});

// Update vendor (admin only)
router.put('/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        console.error('Update vendor error:', error);

        // Handle duplicate name error
        if (error.code === 11000 && error.keyPattern?.name) {
            return res.status(400).json({
                success: false,
                error: `Vendor name "${req.body.name}" is already taken. Please choose a different name.`
            });
        }

        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update vendor'
        });
    }
});

// Delete vendor (admin only)
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete vendor error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
