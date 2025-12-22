import React, { useState, useEffect } from 'react';
import { metersAPI, vendorsAPI } from '../services/api';
import { Button, Card, Select, Input } from '../components/ui';
import './MeterDistribution.css';

export const MeterDistribution: React.FC = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalMeters: 0,
        availableMeters: 0,
        installedMeters: 0,
        vendorCount: 0
    });
    const [selectedVendor, setSelectedVendor] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch vendors and stats
    const fetchData = async () => {
        try {
            const [vendorsResponse, statsResponse] = await Promise.all([
                vendorsAPI.getAll(),
                metersAPI.getStats()
            ]);

            setVendors(vendorsResponse.data);
            setStats(statsResponse.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedVendor || !quantity || parseInt(quantity) < 1) {
            setMessage('❌ Please select vendor and enter valid quantity');
            return;
        }

        setLoading(true);
        try {
            const response = await metersAPI.assign(selectedVendor, parseInt(quantity));
            setMessage(`✅ Successfully assigned ${response.data.assigned} meters to vendor`);

            // Refresh data
            fetchData();

            // Reset form
            setSelectedVendor('');
            setQuantity('1');

            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.error || 'Assignment failed'}`);
        } finally {
            setLoading(false);
        }
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
                            options={vendors.map(v => ({
                                value: v._id || v.id,
                                label: v.name
                            }))}
                        />

                        <Input
                            label="Quantity *"
                            type="number"
                            min="1"
                            max="1000"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Enter number of meters to assign"
                        />

                        {message && (
                            <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
                                {message}
                            </div>
                        )}

                        <Button type="submit" variant="primary" size="lg" disabled={loading}>
                            {loading ? 'Assigning...' : 'Assign Meter'}
                        </Button>
                    </form>
                </Card>

                {/* Stock Summary */}
                <Card className="stock-summary-card">
                    <h3>Stock Summary</h3>

                    <div className="summary-item">
                        <span>Available Meters:</span>
                        <span className="summary-value">{stats.availableMeters}</span>
                    </div>

                    <div className="summary-item">
                        <span>Total Vendors:</span>
                        <span className="summary-value">{stats.vendorCount}</span>
                    </div>

                    <div className="vendors-list">
                        <h4>Vendors</h4>
                        {vendors.map(vendor => (
                            <div key={vendor._id || vendor.id} className="vendor-item">
                                <div>
                                    <div className="vendor-name-small">{vendor.name}</div>
                                    <div className="vendor-contact text-muted">{vendor.contactNumber}</div>
                                </div>
                                <div className="vendor-assigned">
                                    {vendor.assignedMetersCount || 0} assigned
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Info Card */}
            <Card className="info-card">
                <h3>📋 How Meter Assignment Works</h3>
                <div className="info-content">
                    <p>1. <strong>Select a vendor company</strong> from the dropdown</p>
                    <p>2. <strong>Enter quantity</strong> of meters to assign</p>
                    <p>3. System automatically generates unique serial numbers (MTR-00001, MTR-00002, etc.)</p>
                    <p>4. Meters are created with status "AVAILABLE" in the database</p>
                    <p>5. All users from that vendor company can now see these meters</p>
                    <p>6. Installers can then install these meters at customer locations</p>
                </div>
            </Card>
        </div>
    );
};
