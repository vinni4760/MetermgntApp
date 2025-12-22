const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        trim: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null
    },
    vendorName: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['IN_STOCK', 'ASSIGNED', 'IN_TRANSIT', 'INSTALLED'],
        default: 'IN_STOCK'
    },
    assignedDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Meter', meterSchema);
