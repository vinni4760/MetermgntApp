import React, { useState } from 'react';
import { useMeterContext } from '../context/MeterContext';
import { Button, Card, Select, Input } from '../components/ui';
import { MeterStatus } from '../types';
import './MeterDistribution.css';

export const MeterDistribution: React.FC = () => {
    const { meters, vendors, assignMeterToVendor } = useMeterContext();
    const [selectedVendor, setSelectedVendor] = useState('');
    const [meterSerialNumber, setMeterSerialNumber] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [message, setMessage] = useState('');

    const availableMeters = meters.filter(m => m.status === MeterStatus.IN_STOCK);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedVendor || !meterSerialNumber) {
            setMessage('Please fill all required fields');
            return;
        }

        const meter = meters.find(m => m.serialNumber === meterSerialNumber && m.status === MeterStatus.IN_STOCK);

        if (!meter) {
            setMessage('Meter not found or not available');
            return;
        }

        assignMeterToVendor(meter.id, selectedVendor);
        setMessage(`✅ Successfully assigned ${meterSerialNumber} to vendor`);
        setMeterSerialNumber('');

        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="meter-distribution fade-in">
            <div className="page-header">
                <div>
                    <h2>Meter Distribution</h2>
                    <p className="text-muted">Assign meters to vendors for distribution</p>
                </div>
            </div>

            <div className="distribution-container">
                <Card className="distribution-form-card">
                    <h3>Assign Meter to Vendor</h3>

                    <form onSubmit={handleSubmit}>
                        <Select
                            label="Vendor *"
                            value={selectedVendor}
                            onChange={(e) => setSelectedVendor(e.target.value)}
                            options={vendors.map(v => ({ value: v.id, label: v.name }))}
                        />

                        <Select
                            label="Meter Serial Number *"
                            value={meterSerialNumber}
                            onChange={(e) => setMeterSerialNumber(e.target.value)}
                            options={availableMeters.map(m => ({
                                value: m.serialNumber,
                                label: m.serialNumber
                            }))}
                        />

                        <Input
                            label="Quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="1"
                        />

                        {message && (
                            <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
                                {message}
                            </div>
                        )}

                        <Button type="submit" variant="primary" size="lg">
                            Assign Meter
                        </Button>
                    </form>
                </Card>

                {/* Stock Summary */}
                <Card className="stock-summary-card">
                    <h3>Stock Summary</h3>

                    <div className="summary-item">
                        <span>Available Meters:</span>
                        <span className="summary-value">{availableMeters.length}</span>
                    </div>

                    <div className="summary-item">
                        <span>Total Vendors:</span>
                        <span className="summary-value">{vendors.length}</span>
                    </div>

                    <div className="vendors-list">
                        <h4>Vendors</h4>
                        {vendors.map(vendor => (
                            <div key={vendor.id} className="vendor-item">
                                <div>
                                    <div className="vendor-name-small">{vendor.name}</div>
                                    <div className="vendor-contact text-muted">{vendor.contactNumber}</div>
                                </div>
                                <div className="vendor-assigned">
                                    {meters.filter(m => m.vendorId === vendor.id).length} assigned
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Recent Assignments */}
            <Card className="recent-assignments">
                <h3>Recent Assignments</h3>
                <div className="assignments-table">
                    <div className="table-header">
                        <div>Serial Number</div>
                        <div>Vendor</div>
                        <div>Assigned Date</div>
                        <div>Status</div>
                    </div>
                    {meters
                        .filter(m => m.vendorId)
                        .slice(-10)
                        .reverse()
                        .map(meter => (
                            <div key={meter.id} className="table-row">
                                <div className="meter-serial">{meter.serialNumber}</div>
                                <div>{meter.vendorName}</div>
                                <div className="text-muted">
                                    {meter.assignedDate ? new Date(meter.assignedDate).toLocaleDateString() : '-'}
                                </div>
                                <div>
                                    <span className={`status-badge status-${meter.status.toLowerCase()}`}>
                                        {meter.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </Card>
        </div>
    );
};
