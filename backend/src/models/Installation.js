const mongoose = require('mongoose');

const installationSchema = new mongoose.Schema({
    meterSerialNumber: {
        type: String,
        required: [true, 'Meter serial number is required']
    },
    installerName: {
        type: String,
        required: [true, 'Installer name is required']
    },
    vendorName: {
        type: String,
        required: [true, 'Vendor name is required']
    },
    consumerName: {
        type: String,
        required: [true, 'Consumer name is required']
    },
    consumerAddress: {
        type: String,
        required: [true, 'Consumer address is required']
    },
    gpsLocation: {
        latitude: {
            type: Number,
            required: [true, 'Latitude is required']
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required']
        }
    },
    installationDate: {
        type: Date,
        required: [true, 'Installation date is required']
    },
    oldMeterReading: {
        type: String,
        default: ''
    },
    newMeterReading: {
        type: String,
        required: [true, 'New meter reading is required']
    },
    photosBefore: [{
        type: String
    }],
    photosAfter: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['IN_TRANSIT', 'INSTALLED'],
        default: 'IN_TRANSIT'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Installation', installationSchema);
