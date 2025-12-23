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

        // Update meter status based on installation status
        if (installation.meterSerialNumber) {
            // Determine meter status based on installation status
            let meterStatus = 'INSTALLED';
            if (installation.status === 'IN_TRANSIT') {
                meterStatus = 'ASSIGNED_TO_INSTALLER';
            }

            const updateResult = await Meter.findOneAndUpdate(
                { serialNumber: installation.meterSerialNumber },
                {
                    status: meterStatus,
                    installationId: installation._id,
                    installerId: req.user._id
                },
                { new: true }
            );

            if (!updateResult) {
                console.error('Failed to update meter status for:', installation.meterSerialNumber);
            } else {
                console.log(`Updated meter ${installation.meterSerialNumber} to status: ${meterStatus}`);
            }
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

// Update installation status
router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }

        // Find the installation
        const installation = await Installation.findById(id);
        if (!installation) {
            return res.status(404).json({
                success: false,
                error: 'Installation not found'
            });
        }

        // Update installation status
        installation.status = status;
        await installation.save();

        // Update meter status based on new installation status
        if (installation.meterSerialNumber) {
            let meterStatus = 'INSTALLED';
            if (status === 'IN_TRANSIT') {
                meterStatus = 'ASSIGNED_TO_INSTALLER';
            }

            const updateResult = await Meter.findOneAndUpdate(
                { serialNumber: installation.meterSerialNumber },
                {
                    status: meterStatus,
                    installationId: installation._id,
                    installerId: req.user._id
                },
                { new: true }
            );

            if (updateResult) {
                console.log(`Updated meter ${installation.meterSerialNumber} to status: ${meterStatus}`);
            } else {
                console.error('Failed to update meter status for:', installation.meterSerialNumber);
            }
        }

        res.json({
            success: true,
            data: installation,
            message: 'Installation updated successfully'
        });
    } catch (error) {
        console.error('Update installation error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update installation'
        });
    }
});

// Fix existing installations - sync meter statuses (admin only)
router.post('/sync-meter-statuses', protect, async (req, res) => {
    try {
        // Get all installations
        const installations = await Installation.find();

        let updated = 0;
        let failed = 0;

        for (const installation of installations) {
            if (installation.meterSerialNumber) {
                // Determine meter status based on installation status  
                let meterStatus = 'INSTALLED';
                if (installation.status === 'IN_TRANSIT') {
                    meterStatus = 'ASSIGNED_TO_INSTALLER';
                }

                const result = await Meter.findOneAndUpdate(
                    { serialNumber: installation.meterSerialNumber },
                    {
                        status: meterStatus,
                        installationId: installation._id
                    },
                    { new: true }
                );

                if (result) {
                    updated++;
                    console.log(`Synced ${installation.meterSerialNumber} to ${meterStatus}`);
                } else {
                    failed++;
                    console.error(`Failed to sync ${installation.meterSerialNumber}`);
                }
            }
        }

        res.json({
            success: true,
            message: `Synced ${updated} meters, ${failed} failed`,
            stats: { updated, failed, total: installations.length }
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to sync meter statuses'
        });
    }
});

module.exports = router;
