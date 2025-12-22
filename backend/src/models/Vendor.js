const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vendor name is required'],
        trim: true
    },
    contactNumber: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    assignedMetersCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vendor', vendorSchema);
