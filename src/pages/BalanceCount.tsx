import React, { useState, useEffect } from 'react';
import { useMeterContext } from '../context/MeterContext';
import { Card, Select, Badge } from '../components/ui';
import './BalanceCount.css';

export const BalanceCount: React.FC = () => {
    const { meters, vendors } = useMeterContext();
    const [selectedVendor, setSelectedVendor] = useState<string>('all');

    // Debug logging
    useEffect(() => {
        if (meters.length > 0) {
            console.log('BalanceCount - Sample meter:', meters[0]);
            console.log('BalanceCount - Total meters:', meters.length);
        }
        if (vendors.length > 0) {
            console.log('BalanceCount - Vendors:', vendors);
        }
    }, [meters, vendors]);

    const filteredMeters = selectedVendor === 'all'
        ? meters
        : meters.filter(m => {
            // Handle both _id and id formats from API
            const meterVendorId =
                (m.vendorId as any)?._id || (m as any).vendor?._id;
            console.log('BalanceCount - Meter vendor ID:', meterVendorId);
            console.log('BalanceCount - Selected vendor:', selectedVendor);
            console.log('BalanceCount - Meter vendor ID type:', typeof meterVendorId);
            console.log('BalanceCount - Selected vendor type:', typeof selectedVendor);
            return meterVendorId === selectedVendor;
        });

    console.log('BalanceCount - Selected vendor:', selectedVendor);
    console.log('BalanceCount - Filtered meters count:', filteredMeters.length);

    const filteredStock = {
        total: filteredMeters.length,
        inStock: filteredMeters.filter(m => m.status === 'AVAILABLE').length,
        assigned: filteredMeters.filter(m => m.status === 'ASSIGNED_TO_INSTALLER').length,
        inTransit: 0, // Backend doesn't have separate in-transit status
        installed: filteredMeters.filter(m => m.status === 'INSTALLED').length,
    };

    console.log('BalanceCount - Filtered stock:', filteredStock);
    console.log('BalanceCount - Used meters:', filteredStock.inStock);
    console.log('BalanceCount - Balance count:', filteredStock.installed);

    const usedMeters = filteredStock.assigned + filteredStock.inTransit + filteredStock.installed;
    const balanceCount = filteredStock.total - usedMeters;

    return (
        <div className="balance-count fade-in">
            <div className="page-header">
                <div>
                    <h2>Balance Count of Meters</h2>
                    <p className="text-muted">Auto-calculated: Balance = Stock - Used</p>
                </div>
                <Select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Vendors' },
                        ...vendors.map(v => ({ value: (v as any)._id || v.id, label: v.name }))
                    ]}
                />
            </div>

            {/* Stock Summary Cards */}
            <div className="stock-cards-grid">
                <Card className="stock-card stock-card-primary">
                    <div className="stock-card-icon">📦</div>
                    <div className="stock-card-value">{filteredStock.total}</div>
                    <div className="stock-card-label">Total Stock</div>
                </Card>

                <Card className="stock-card stock-card-warning">
                    <div className="stock-card-icon">📤</div>
                    <div className="stock-card-value">{usedMeters}</div>
                    <div className="stock-card-label">Used Meters</div>
                    <div className="stock-card-breakdown">
                        <span>{filteredStock.assigned} Assigned</span>
                        <span>{filteredStock.inTransit} In Transit</span>
                        <span>{filteredStock.installed} Installed</span>
                    </div>
                </Card>

                <Card className="stock-card stock-card-success">
                    <div className="stock-card-icon">✅</div>
                    <div className="stock-card-value balance-value">{balanceCount}</div>
                    <div className="stock-card-label">Balance Count</div>
                    <div className="stock-card-formula">= {filteredStock.total} - {usedMeters}</div>
                </Card>
            </div>

            {/* Stock Distribution Chart */}
            <Card className="distribution-card">
                <h3>Stock Distribution</h3>
                <div className="distribution-bars">
                    <div className="distribution-item">
                        <div className="distribution-label">
                            <span>In Stock</span>
                            <span className="distribution-value">{filteredStock.inStock}</span>
                        </div>
                        <div className="distribution-bar">
                            <div
                                className="distribution-fill fill-success"
                                style={{ width: `${(filteredStock.inStock / filteredStock.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="distribution-item">
                        <div className="distribution-label">
                            <span>Assigned</span>
                            <span className="distribution-value">{filteredStock.assigned}</span>
                        </div>
                        <div className="distribution-bar">
                            <div
                                className="distribution-fill fill-warning"
                                style={{ width: `${(filteredStock.assigned / filteredStock.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="distribution-item">
                        <div className="distribution-label">
                            <span>In Transit</span>
                            <span className="distribution-value">{filteredStock.inTransit}</span>
                        </div>
                        <div className="distribution-bar">
                            <div
                                className="distribution-fill fill-info"
                                style={{ width: `${(filteredStock.inTransit / filteredStock.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="distribution-item">
                        <div className="distribution-label">
                            <span>Installed</span>
                            <span className="distribution-value">{filteredStock.installed}</span>
                        </div>
                        <div className="distribution-bar">
                            <div
                                className="distribution-fill fill-primary"
                                style={{ width: `${(filteredStock.installed / filteredStock.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Meters Table */}
            <Card className="meters-table-card">
                <h3>Meter Inventory</h3>
                <div className="meters-table">
                    <div className="table-header">
                        <div>Serial Number</div>
                        <div>Vendor</div>
                        <div>Status</div>
                        <div>Assigned Date</div>
                    </div>
                    {filteredMeters.map(meter => (
                        <div key={meter.id} className="table-row">
                            <div className="meter-serial">{meter.serialNumber}</div>
                            <div>{meter.vendorName || '-'}</div>
                            <div>
                                <Badge
                                    variant={
                                        meter.status === 'AVAILABLE' ? 'success' :
                                            meter.status === 'ASSIGNED_TO_INSTALLER' ? 'warning' :
                                                meter.status === 'INSTALLED' ? 'info' :
                                                    'default'
                                    }
                                >
                                    {meter.status.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                            <div className="text-muted">
                                {meter.assignedDate ? new Date(meter.assignedDate).toLocaleDateString() : '-'}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
