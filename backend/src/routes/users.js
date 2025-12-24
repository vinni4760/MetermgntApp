const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendCredentialsEmail } = require('../services/emailService');

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
        // Store plain password before user creation (it will be hashed)
        const plainPassword = req.body.password;
        const userEmail = req.body.email;

        const user = await User.create(req.body);

        // Send credentials email if email is provided
        let emailSent = false;
        if (userEmail) {
            const emailResult = await sendCredentialsEmail(
                userEmail,
                user.username,
                plainPassword,
                user.role
            );
            emailSent = emailResult.success;

            if (!emailResult.success) {
                console.warn('Failed to send email:', emailResult.message);
            }
        }

        // Return without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse,
            emailSent: emailSent,
            message: emailSent
                ? `User created successfully! Login credentials sent to ${userEmail}`
                : 'User created successfully. No email sent (email not configured or not provided).'
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
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check for duplicate username if username is being changed
        if (req.body.username && req.body.username !== user.username) {
            const existingUser = await User.findOne({ username: req.body.username });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: `Username '${req.body.username}' already exists`
                });
            }
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            user[key] = req.body[key];
        });

        // Save will trigger the pre-save hook to hash password if it was modified
        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        console.error('Update user error:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const value = error.keyValue[field];
            return res.status(400).json({
                success: false,
                error: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`
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
