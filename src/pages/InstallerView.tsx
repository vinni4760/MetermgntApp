import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeterContext } from '../context/MeterContext';
import { Card, Button } from '../components/ui';
import type { Installation } from '../types';
import { InstallationStatus } from '../types';
import './InstallerView.css';

export const InstallerView: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { installations } = useMeterContext();
    const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);

    // Filter installations by current installer
    const myInstallations = installations.filter(
        i => i.installerName === user?.name
    );

    const todayInstallations = myInstallations.filter(i => {
        const today = new Date().toDateString();
        return new Date(i.installationDate).toDateString() === today;
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="installer-view">
            {/* Header */}
            <div className="installer-header">
                <div className="installer-header-content">
                    <div className="installer-logo">⚡</div>
                    <div>
                        <h1>Installer Dashboard</h1>
                        <p className="text-muted">Welcome, {user?.name}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleLogout} size="sm">
                    Logout
                </Button>
            </div>

            {/* Stats */}
            <div className="installer-stats">
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">{todayInstallations.length}</div>
                    <div className="stat-label-installer">Today's Installations</div>
                </Card>
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">
                        {myInstallations.filter(i => i.status === InstallationStatus.IN_TRANSIT).length}
                    </div>
                    <div className="stat-label-installer">In Transit</div>
                </Card>
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">{myInstallations.length}</div>
                    <div className="stat-label-installer">Total Installations</div>
                </Card>
            </div>

            {/* Main Action */}
            <div className="installer-main-action">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/daily-installation')}
                    className="new-installation-button"
                >
                    ⚡ New Installation
                </Button>
                <p className="text-muted">Log a new meter installation</p>
            </div>

            {/* Recent Installations */}
            <Card className="recent-installations-card">
                <h3>My Recent Installations</h3>
                {myInstallations.length > 0 ? (
                    <div className="installations-list-installer">
                        {myInstallations.slice(-10).reverse().map((installation) => (
                            <div
                                key={installation.id}
                                className="installation-item-installer clickable"
                                onClick={() => setSelectedInstallation(installation)}
                            >
                                <div className="installation-header-row">
                                    <div className="meter-serial-installer">{installation.meterSerialNumber}</div>
                                    <span className={`status-dot ${installation.status === InstallationStatus.INSTALLED ? 'status-installed' : 'status-transit'}`}>
                                        {installation.status === InstallationStatus.INSTALLED ? '✓ Installed' : '🚚 In Transit'}
                                    </span>
                                </div>
                                <div className="installation-details-row">
                                    <span className="text-muted">👥 {installation.consumerName}</span>
                                    <span className="text-muted">📅 {new Date(installation.installationDate).toLocaleDateString()}</span>
                                </div>
                                <div className="installation-address text-muted">
                                    📍 {installation.consumerAddress}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-installations">
                        <div className="no-installations-icon">📭</div>
                        <p>No installations yet</p>
                        <p className="text-muted">Click "New Installation" to get started</p>
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
                                <span className="detail-label">Consumer Name</span>
                                <span className="detail-value">{selectedInstallation.consumerName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Consumer Address</span>
                                <span className="detail-value">{selectedInstallation.consumerAddress}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Vendor</span>
                                <span className="detail-value">{selectedInstallation.vendorName}</span>
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
