const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Create user (admin only)
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const user = await User.create(req.body);

        // Return without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        console.error('Create user error:', error);

        // Handle duplicate username error
        if (error.code === 11000 && error.keyPattern?.username) {
            return res.status(400).json({
                success: false,
                error: `Username "${req.body.username}" already exists. Please choose a different username.`
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
            error: error.message || 'Failed to create user'
        });
    }
});

// Update user (admin only)
router.put('/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);

        // Handle duplicate username error
        if (error.code === 11000 && error.keyPattern?.username) {
            return res.status(400).json({
                success: false,
                error: `Username "${req.body.username}" is already taken. Please choose a different username.`
            });
        }

        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update user'
        });
    }
});

// Delete user (admin only)
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
