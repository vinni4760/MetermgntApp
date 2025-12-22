const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'ASSIGNED_TO_INSTALLER', 'INSTALLED', 'DAMAGED'],
        default: 'AVAILABLE'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    installerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    installationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Installation',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for id
meterSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialized
meterSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Meter', meterSchema);
