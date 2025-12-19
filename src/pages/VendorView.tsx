import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeterContext } from '../context/MeterContext';
import { Card, Button, Badge } from '../components/ui';
import { MeterStatus, InstallationStatus } from '../types';
import './VendorView.css';

export const VendorView: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { meters, installations, vendors } = useMeterContext();

    // Find vendor data
    const vendor = vendors.find(v => v.id === user?.vendorId);

    // Filter data for this vendor
    const vendorMeters = meters.filter(m => m.vendorId === user?.vendorId);
    const vendorInstallations = installations.filter(i =>
        vendorMeters.some(m => m.serialNumber === i.meterSerialNumber)
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="vendor-view">
            {/* Header */}
            <div className="vendor-header">
                <div className="vendor-header-content">
                    <div className="vendor-logo">🏢</div>
                    <div>
                        <h1>{vendor?.name || user?.name}</h1>
                        <p className="text-muted">Vendor Dashboard</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleLogout} size="sm">
                    Logout
                </Button>
            </div>

            {/* Stats */}
            <div className="vendor-stats">
                <Card className="stat-card-vendor">
                    <div className="stat-value-vendor">{vendorMeters.length}</div>
                    <div className="stat-label-vendor">Total Assigned Meters</div>
                </Card>
                <Card className="stat-card-vendor">
                    <div className="stat-value-vendor">
                        {vendorMeters.filter(m => m.status === MeterStatus.IN_STOCK).length}
                    </div>
                    <div className="stat-label-vendor">In Stock</div>
                </Card>
                <Card className="stat-card-vendor">
                    <div className="stat-value-vendor">
                        {vendorInstallations.filter(i => i.status === InstallationStatus.IN_TRANSIT).length}
                    </div>
                    <div className="stat-label-vendor">In Transit</div>
                </Card>
                <Card className="stat-card-vendor">
                    <div className="stat-value-vendor">
                        {vendorInstallations.filter(i => i.status === InstallationStatus.INSTALLED).length}
                    </div>
                    <div className="stat-label-vendor">Installed</div>
                </Card>
            </div>

            {/* Meters Section */}
            <Card className="vendor-section-card">
                <h3>Assigned Meters</h3>
                {vendorMeters.length > 0 ? (
                    <div className="meters-grid">
                        {vendorMeters.map((meter) => (
                            <div key={meter.id} className="meter-item-vendor">
                                <div className="meter-serial">{meter.serialNumber}</div>
                                <Badge variant={
                                    meter.status === MeterStatus.INSTALLED ? 'success' :
                                        meter.status === MeterStatus.IN_TRANSIT ? 'info' :
                                            meter.status === MeterStatus.ASSIGNED ? 'warning' : 'default'
                                }>
                                    {meter.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">📦</div>
                        <p>No meters assigned yet</p>
                    </div>
                )}
            </Card>

            {/* Installations Section */}
            <Card className="vendor-section-card">
                <h3>Recent Installations ({vendorInstallations.length})</h3>
                {vendorInstallations.length > 0 ? (
                    <div className="installations-list-vendor">
                        {vendorInstallations.slice(-10).reverse().map((installation) => (
                            <div key={installation.id} className="installation-item-vendor">
                                <div className="installation-header-row">
                                    <div className="meter-serial-vendor">{installation.meterSerialNumber}</div>
                                    <Badge variant={installation.status === InstallationStatus.INSTALLED ? 'success' : 'info'}>
                                        {installation.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="installation-details-row">
                                    <span className="text-muted">👤 {installation.installerName}</span>
                                    <span className="text-muted">👥 {installation.consumerName}</span>
                                </div>
                                <div className="installation-address text-muted">
                                    📍 {installation.consumerAddress}
                                </div>
                                <div className="installation-date text-muted">
                                    📅 {new Date(installation.installationDate).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">📭</div>
                        <p>No installations yet</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
