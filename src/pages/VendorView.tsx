import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeterContext } from '../context/MeterContext';
import { Card, Button, Badge } from '../components/ui';
import type { Installation } from '../types';
import { MeterStatus, InstallationStatus } from '../types';
import './VendorView.css';

export const VendorView: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { meters, installations, vendors } = useMeterContext();
    const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);

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
                            <div
                                key={installation.id}
                                className="installation-item-vendor clickable"
                                onClick={() => setSelectedInstallation(installation)}
                            >
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

            {/* Installation Detail Modal */}
            {selectedInstallation && (
                <div className="modal-overlay" onClick={() => setSelectedInstallation(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Installation Details</h2>
                            <button className="modal-close" onClick={() => setSelectedInstallation(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="detail-label">Meter Serial Number</span>
                                <span className="detail-value">{selectedInstallation.meterSerialNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <span className={`detail-value ${selectedInstallation.status === InstallationStatus.INSTALLED ? 'text-success' : 'text-info'}`}>
                                    {selectedInstallation.status === InstallationStatus.INSTALLED ? '✓ Installed' : '🚚 In Transit'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Installer Name</span>
                                <span className="detail-value">{selectedInstallation.installerName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Consumer Name</span>
                                <span className="detail-value">{selectedInstallation.consumerName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Consumer Address</span>
                                <span className="detail-value">{selectedInstallation.consumerAddress}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Installation Date</span>
                                <span className="detail-value">{new Date(selectedInstallation.installationDate).toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">GPS Location</span>
                                <div className="detail-value-with-button">
                                    <span className="detail-value">
                                        📍 {selectedInstallation.gpsLocation.latitude.toFixed(6)}, {selectedInstallation.gpsLocation.longitude.toFixed(6)}
                                    </span>
                                    <button
                                        className="map-button"
                                        onClick={() => {
                                            const lat = selectedInstallation.gpsLocation.latitude;
                                            const lng = selectedInstallation.gpsLocation.longitude;
                                            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                        }}
                                    >
                                        🗺️ View on Map
                                    </button>
                                </div>
                            </div>
                            {selectedInstallation.oldMeterReading && (
                                <div className="detail-row">
                                    <span className="detail-label">Old Meter Reading</span>
                                    <span className="detail-value">{selectedInstallation.oldMeterReading}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="detail-label">New Meter Reading</span>
                                <span className="detail-value">{selectedInstallation.newMeterReading}</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="outline" onClick={() => setSelectedInstallation(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
