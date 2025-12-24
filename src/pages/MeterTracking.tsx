import React, { useState, useEffect } from 'react';
import { installationsAPI } from '../services/api';
import { Card, Badge, Select, Modal } from '../components/ui';
import { InstallationStatus } from '../types';
import { InstallationMap } from '../components/Map/InstallationMap';
import './MeterTracking.css';

export const MeterTracking: React.FC = () => {
    const [installations, setInstallations] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [installerFilter, setInstallerFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [selectedInstallation, setSelectedInstallation] = useState<any | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        const fetchInstallations = async () => {
            try {
                const response = await installationsAPI.getAll();
                setInstallations(response.data);
            } catch (error) {
                console.error('Failed to fetch installations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstallations();
    }, []);

    const uniqueInstallers = Array.from(new Set(installations.map(i => i.installerName)));

    const filteredInstallations = installations.filter(installation => {
        const matchesStatus = statusFilter === 'all' || installation.status === statusFilter;
        const matchesInstaller = installerFilter === 'all' || installation.installerName === installerFilter;
        return matchesStatus && matchesInstaller;
    });

    // Pagination
    const totalPages = Math.ceil(filteredInstallations.length / ITEMS_PER_PAGE);
    const paginatedInstallations = filteredInstallations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, installerFilter]);

    if (loading) {
        return (
            <div className="meter-tracking fade-in">
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            </div>
        );
    }

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
                    <>
                        {paginatedInstallations.map(installation => {
                            return (
                                <div
                                    key={installation.id || installation._id}
                                    onClick={() => setSelectedInstallation(installation)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Card className="installation-card">
                                        <div className="installation-card-header">
                                            <div className="meter-serial-large">{installation.meterSerialNumber}</div>
                                            <Badge
                                                variant={installation.status === InstallationStatus.INSTALLED ? 'success' : 'info'}
                                                pulse={installation.status === InstallationStatus.IN_TRANSIT}
                                            >
                                                {installation.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}

                        {/* Modal for Installation Details */}
                        <Modal
                            isOpen={selectedInstallation !== null}
                            onClose={() => setSelectedInstallation(null)}
                            title={`Meter: ${selectedInstallation?.meterSerialNumber || ''}`}
                        >
                            {selectedInstallation && (
                                <div className="installation-details">
                                    <div className="detail-row">
                                        <span className="detail-label">� Status:</span>
                                        <span className="detail-value">
                                            <Badge
                                                variant={selectedInstallation.status === InstallationStatus.INSTALLED ? 'success' : 'info'}
                                                pulse={selectedInstallation.status === InstallationStatus.IN_TRANSIT}
                                            >
                                                {selectedInstallation.status.replace('_', ' ')}
                                            </Badge>
                                        </span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">👤 Installer:</span>
                                        <span className="detail-value">{selectedInstallation.installerName}</span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">🏢 Vendor:</span>
                                        <span className="detail-value">{selectedInstallation.vendorName || 'N/A'}</span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">👥 Consumer:</span>
                                        <span className="detail-value">{selectedInstallation.consumerName}</span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">📍 Address:</span>
                                        <span className="detail-value">{selectedInstallation.consumerAddress}</span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">📅 Installation Date:</span>
                                        <span className="detail-value">
                                            {new Date(selectedInstallation.installationDate).toLocaleString()}
                                        </span>
                                    </div>

                                    {selectedInstallation.gpsLocation && (
                                        <div className="detail-row gps-row">
                                            <span className="detail-label">🌍 GPS Location:</span>
                                            <div className="gps-value-container">
                                                <span className="detail-value gps-coords">
                                                    {selectedInstallation.gpsLocation.latitude?.toFixed(6)}, {selectedInstallation.gpsLocation.longitude?.toFixed(6)}
                                                </span>
                                                <button
                                                    className="map-button-inline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const lat = selectedInstallation.gpsLocation.latitude;
                                                        const lng = selectedInstallation.gpsLocation.longitude;
                                                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                                    }}
                                                >
                                                    🗺️ View on Google Maps
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {selectedInstallation.newMeterReading && (
                                        <div className="detail-row">
                                            <span className="detail-label">📊 New Meter Reading:</span>
                                            <span className="detail-value">{selectedInstallation.newMeterReading}</span>
                                        </div>
                                    )}

                                    {selectedInstallation.oldMeterReading && (
                                        <div className="detail-row">
                                            <span className="detail-label">📊 Old Meter Reading:</span>
                                            <span className="detail-value">{selectedInstallation.oldMeterReading}</span>
                                        </div>
                                    )}

                                    {selectedInstallation.createdAt && (
                                        <div className="detail-row">
                                            <span className="detail-label">📝 Record Created:</span>
                                            <span className="detail-value">
                                                {new Date(selectedInstallation.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Modal>


                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{
                                gridColumn: '1 / -1',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '2rem',
                                gap: '1rem'
                            }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: currentPage === 1 ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                        color: currentPage === 1 ? 'var(--text-secondary)' : 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ← Previous
                                </button>
                                <span style={{
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    padding: '0 1rem'
                                }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: currentPage === totalPages ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                        color: currentPage === totalPages ? 'var(--text-secondary)' : 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
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
