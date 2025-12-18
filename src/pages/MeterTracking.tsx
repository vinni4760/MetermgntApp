import React, { useState } from 'react';
import { useMeterContext } from '../context/MeterContext';
import { Card, Badge, Select } from '../components/ui';
import { InstallationStatus } from '../types';
import { InstallationMap } from '../components/Map/InstallationMap';
import './MeterTracking.css';

export const MeterTracking: React.FC = () => {
    const { installations } = useMeterContext();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [installerFilter, setInstallerFilter] = useState<string>('all');

    const uniqueInstallers = Array.from(new Set(installations.map(i => i.installerName)));

    const filteredInstallations = installations.filter(installation => {
        const matchesStatus = statusFilter === 'all' || installation.status === statusFilter;
        const matchesInstaller = installerFilter === 'all' || installation.installerName === installerFilter;
        return matchesStatus && matchesInstaller;
    });

    return (
        <div className="meter-tracking fade-in">
            <div className="page-header">
                <div>
                    <h2>Meter Tracking - Real-Time Location</h2>
                    <p className="text-muted">Monitor meter installations and real-time GPS locations</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="filters-card">
                <div className="filters-grid">
                    <Select
                        label="Filter by Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: InstallationStatus.IN_TRANSIT, label: 'In Transit' },
                            { value: InstallationStatus.INSTALLED, label: 'Installed' },
                        ]}
                    />
                    <Select
                        label="Filter by Installer"
                        value={installerFilter}
                        onChange={(e) => setInstallerFilter(e.target.value)}
                        options={[
                            { value: 'all', label: 'All Installers' },
                            ...uniqueInstallers.map(name => ({ value: name, label: name }))
                        ]}
                    />
                </div>
            </Card>

            {/* Live Status Summary */}
            <div className="status-summary-grid">
                <Card className="summary-card summary-transit">
                    <div className="summary-icon">🚚</div>
                    <div className="summary-value">
                        {installations.filter(i => i.status === InstallationStatus.IN_TRANSIT).length}
                    </div>
                    <div className="summary-label">In Transit</div>
                </Card>

                <Card className="summary-card summary-installed">
                    <div className="summary-icon">✓</div>
                    <div className="summary-value">
                        {installations.filter(i => i.status === InstallationStatus.INSTALLED).length}
                    </div>
                    <div className="summary-label">Installed</div>
                </Card>

                <Card className="summary-card summary-total">
                    <div className="summary-icon">📊</div>
                    <div className="summary-value">{installations.length}</div>
                    <div className="summary-label">Total Installations</div>
                </Card>
            </div>

            {/* Interactive GPS Map */}
            <Card className="map-container">
                <h3>📍 Live GPS Tracking Map</h3>
                <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    Click on markers to view installation details • {filteredInstallations.length} location(s) displayed
                </p>
                <InstallationMap installations={filteredInstallations} />
            </Card>

            {/* Installation Cards Grid */}
            <div className="installations-grid">
                {filteredInstallations.length > 0 ? (
                    filteredInstallations.map(installation => (
                        <Card key={installation.id} className="installation-card">
                            <div className="installation-card-header">
                                <div className="meter-serial-large">{installation.meterSerialNumber}</div>
                                <Badge
                                    variant={installation.status === InstallationStatus.INSTALLED ? 'success' : 'info'}
                                    pulse={installation.status === InstallationStatus.IN_TRANSIT}
                                >
                                    {installation.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div className="installation-details">
                                <div className="detail-row">
                                    <span className="detail-label">👤 Installer:</span>
                                    <span className="detail-value">{installation.installerName}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">🏢 Vendor:</span>
                                    <span className="detail-value">{installation.vendorName || 'N/A'}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">👥 Consumer:</span>
                                    <span className="detail-value">{installation.consumerName}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">📍 Address:</span>
                                    <span className="detail-value">{installation.consumerAddress}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">📅 Date:</span>
                                    <span className="detail-value">
                                        {new Date(installation.installationDate).toLocaleString()}
                                    </span>
                                </div>

                                <div className="detail-row gps-row">
                                    <span className="detail-label">🌍 GPS:</span>
                                    <span className="detail-value gps-coords">
                                        {installation.gpsLocation.latitude.toFixed(6)}, {installation.gpsLocation.longitude.toFixed(6)}
                                    </span>
                                </div>

                                {installation.newMeterReading && (
                                    <div className="detail-row">
                                        <span className="detail-label">📊 New Reading:</span>
                                        <span className="detail-value">{installation.newMeterReading}</span>
                                    </div>
                                )}

                                {installation.oldMeterReading && (
                                    <div className="detail-row">
                                        <span className="detail-label">📊 Old Reading:</span>
                                        <span className="detail-value">{installation.oldMeterReading}</span>
                                    </div>
                                )}
                            </div>

                            <div className="installation-card-footer">
                                <span className="text-muted">
                                    Logged {new Date(installation.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">📭</div>
                        <p>No installations found</p>
                        <p className="text-muted">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};
