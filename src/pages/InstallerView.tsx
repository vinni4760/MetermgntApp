import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { installationsAPI } from '../services/api';
import { Button, Card } from '../components/ui';
import './InstallerView.css';

export const InstallerView: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [installations, setInstallations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstallation, setSelectedInstallation] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const INSTALLATIONS_PER_PAGE = 5;

    useEffect(() => {
        const fetchInstallations = async () => {
            try {
                const response = await installationsAPI.getAll();
                // Filter installations for this installer
                const myInstallations = response.data.filter(
                    (inst: any) => inst.installerName === user?.name || inst.installerId === user?.id
                );
                console.log('Installer installations:', myInstallations);
                setInstallations(myInstallations);
            } catch (error) {
                console.error('Failed to fetch installations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchInstallations();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNewInstallation = () => {
        navigate('/daily-installation');
    };

    const handleViewDetails = (installation: any) => {
        setSelectedInstallation(installation);
    };

    const closeModal = () => {
        setSelectedInstallation(null);
    };

    if (loading) {
        return (
            <div className="installer-view">
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading installer dashboard...</p>
                </div>
            </div>
        );
    }

    const todayInstallations = installations.filter(inst => {
        const today = new Date().toDateString();
        return new Date(inst.installationDate || inst.createdAt).toDateString() === today;
    });

    const completedInstallations = installations.filter(
        inst => inst.status === 'INSTALLED' || inst.status === 'COMPLETED'
    );

    // Pagination
    const totalPages = Math.ceil(installations.length / INSTALLATIONS_PER_PAGE);
    const paginatedInstallations = installations.slice(
        (currentPage - 1) * INSTALLATIONS_PER_PAGE,
        currentPage * INSTALLATIONS_PER_PAGE
    );

    return (
        <div className="installer-view">
            <div className="installer-header">
                <div className="installer-header-content">
                    <div className="installer-logo">👷</div>
                    <div>
                        <h1>Installer Dashboard</h1>
                        <p className="text-muted">Welcome, {user?.name}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleLogout} size="sm">
                    Logout
                </Button>
            </div>

            <div className="installer-stats">
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">{todayInstallations.length}</div>
                    <div className="stat-label-installer">Installations Today</div>
                </Card>
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">{completedInstallations.length}</div>
                    <div className="stat-label-installer">Total Completed</div>
                </Card>
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">{installations.length}</div>
                    <div className="stat-label-installer">All Installations</div>
                </Card>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <Button variant="primary" size="lg" onClick={handleNewInstallation}>
                    ➕ Add New Installation
                </Button>
            </div>

            <Card className="installer-section-card">
                <h3>Recent Installations ({installations.length})</h3>
                {installations.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {paginatedInstallations.map((inst: any) => (
                                <div
                                    key={inst.id || inst._id}
                                    onClick={() => handleViewDetails(inst)}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        background: 'var(--bg-card)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-card)';
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                                        {inst.meterSerialNumber || 'N/A'}
                                    </div>
                                    <div style={{
                                        padding: '0.35rem 0.85rem',
                                        borderRadius: '6px',
                                        background: inst.status === 'INSTALLED' ? 'var(--success)' : 'var(--warning)',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {inst.status || 'PENDING'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: currentPage === 1 ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                        color: currentPage === 1 ? 'var(--text-secondary)' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    ← Previous
                                </button>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: currentPage === totalPages ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                        color: currentPage === totalPages ? 'var(--text-secondary)' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">📋</div>
                        <p>No installations recorded yet</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            Click "Add New Installation" to record your first installation
                        </p>
                    </div>
                )}
            </Card>

            {/* Installation Detail Modal */}
            {selectedInstallation && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }} onClick={closeModal}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        background: '#1a1d29',
                        borderRadius: '12px',
                        border: '1px solid #2d3748',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                    }} onClick={(e: any) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid #2d3748',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#e2e8f0' }}>Installation Details</h3>
                            <button onClick={closeModal} style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.75rem',
                                cursor: 'pointer',
                                color: '#a0aec0',
                                lineHeight: 1,
                                padding: 0
                            }}>×</button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflow: 'auto' }}>
                            {/* Meter Serial */}
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#e2e8f0', opacity: 0.9, marginBottom: '0.25rem' }}>
                                    Meter Serial Number
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                                    {selectedInstallation.meterSerialNumber}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <span style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '20px',
                                    background: selectedInstallation.status === 'INSTALLED'
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                }}>
                                    {selectedInstallation.status}
                                </span>
                            </div>

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {/* Consumer */}
                                <div style={{ background: '#252936', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ color: '#a0aec0', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        👤 CONSUMER
                                    </div>
                                    <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{selectedInstallation.consumerName}</div>
                                    <div style={{ color: '#718096', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        {selectedInstallation.consumerAddress}
                                    </div>
                                </div>

                                {/* Installation Info */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                        <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.375rem' }}>VENDOR</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500 }}>
                                            {selectedInstallation.vendorName || 'N/A'}
                                        </div>
                                    </div>
                                    <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                        <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.375rem' }}>INSTALLER</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500 }}>
                                            {selectedInstallation.installerName}
                                        </div>
                                    </div>
                                </div>

                                {/* Date */}
                                <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                    <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.375rem' }}>📅 DATE & TIME</div>
                                    <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                                        {new Date(selectedInstallation.installationDate).toLocaleString()}
                                    </div>
                                </div>

                                {/* GPS */}
                                {selectedInstallation.gpsLocation && (
                                    <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                        <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.375rem' }}>📍 LOCATION</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                                            {selectedInstallation.gpsLocation.latitude.toFixed(6)}, {selectedInstallation.gpsLocation.longitude.toFixed(6)}
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${selectedInstallation.gpsLocation.latitude},${selectedInstallation.gpsLocation.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: '#667eea',
                                                fontSize: '0.8rem',
                                                marginTop: '0.25rem',
                                                display: 'inline-block',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            View on Google Maps →
                                        </a>
                                    </div>
                                )}

                                {/* Photos Before */}
                                {selectedInstallation.photosBefore && selectedInstallation.photosBefore.length > 0 && (
                                    <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                        <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.5rem' }}>📷 PHOTOS BEFORE</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                                            {selectedInstallation.photosBefore.map((url: string, index: number) => (
                                                <img
                                                    key={index}
                                                    src={url}
                                                    alt={`Before ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100px',
                                                        objectFit: 'cover',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        border: '2px solid #2d3748',
                                                        transition: 'transform 0.2s, border-color 0.2s'
                                                    }}
                                                    onClick={() => window.open(url, '_blank')}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                        e.currentTarget.style.borderColor = '#667eea';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.borderColor = '#2d3748';
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Photos After */}
                                {selectedInstallation.photosAfter && selectedInstallation.photosAfter.length > 0 && (
                                    <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                        <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.5rem' }}>📷 PHOTOS AFTER</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                                            {selectedInstallation.photosAfter.map((url: string, index: number) => (
                                                <img
                                                    key={index}
                                                    src={url}
                                                    alt={`After ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100px',
                                                        objectFit: 'cover',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        border: '2px solid #2d3748',
                                                        transition: 'transform 0.2s, border-color 0.2s'
                                                    }}
                                                    onClick={() => window.open(url, '_blank')}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                        e.currentTarget.style.borderColor = '#667eea';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.borderColor = '#2d3748';
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Readings */}
                                {(selectedInstallation.oldMeterReading || selectedInstallation.newMeterReading) && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        {selectedInstallation.oldMeterReading && (
                                            <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                                <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.375rem' }}>OLD READING</div>
                                                <div style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}>
                                                    {selectedInstallation.oldMeterReading}
                                                </div>
                                            </div>
                                        )}
                                        {selectedInstallation.newMeterReading && (
                                            <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                                <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.375rem' }}>NEW READING</div>
                                                <div style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}>
                                                    {selectedInstallation.newMeterReading}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #2d3748' }}>
                            <Button onClick={closeModal} variant="outline" style={{ width: '100%', background: '#252936', border: '1px solid #2d3748' }}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
