import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { metersAPI, vendorsAPI, installationsAPI } from '../services/api';
import { Card } from '../components/ui';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalMeters: 0,
        availableMeters: 0,
        installedMeters: 0,
        totalVendors: 0,
        inTransitMeters: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentInstallations, setRecentInstallations] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedInstallation, setSelectedInstallation] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [metersRes, vendorsRes, installationsRes] = await Promise.all([
                    metersAPI.getStats(),
                    vendorsAPI.getAll(),
                    installationsAPI.getAll()
                ]);

                const installations = installationsRes.data;

                setStats({
                    totalMeters: metersRes.data.totalMeters,
                    availableMeters: metersRes.data.availableMeters,
                    installedMeters: metersRes.data.installedMeters,
                    totalVendors: metersRes.data.vendorCount,
                    inTransitMeters: installations.filter((i: any) => i.status === 'IN_TRANSIT').length
                });

                setRecentInstallations(installations.slice(0, 5));
                setVendors(vendorsRes.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const dashboardStats = [
        {
            label: 'Total Meters',
            value: stats.totalMeters,
            icon: '📦',
            color: 'var(--accent-info)',
            link: '/meter-distribution'
        },
        {
            label: 'Available',
            value: stats.availableMeters,
            icon: '✅',
            color: 'var(--accent-success)',
            link: '/meter-distribution'
        },
        {
            label: 'Installed',
            value: stats.installedMeters,
            icon: '✓',
            color: 'var(--accent-primary)',
            link: '/meter-tracking'
        },
        {
            label: 'In Transit',
            value: stats.inTransitMeters,
            icon: '🚚',
            color: 'var(--accent-secondary)',
            link: '/meter-tracking'
        },
        {
            label: 'Vendor Companies',
            value: stats.totalVendors,
            icon: '🏢',
            color: 'var(--accent-warning)',
            link: '/manage-vendor-entities'
        },
    ];

    if (loading) {
        return (
            <div className="dashboard fade-in">
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <div>
                    <h2>Welcome to Meter Management System</h2>
                    <p className="text-muted">Monitor and manage your meter inventory in real-time</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {dashboardStats.map((stat, index) => (
                    <Link to={stat.link} key={index} style={{ textDecoration: 'none' }}>
                        <Card className="stat-card">
                            <div className="stat-icon" style={{ color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                    <Link to="/meter-distribution" style={{ textDecoration: 'none' }}>
                        <Card className="action-card">
                            <div className="action-icon">📝</div>
                            <h4>Assign Meters</h4>
                            <p className="text-muted">Distribute meters to vendors</p>
                        </Card>
                    </Link>

                    <Link to="/manage-installers" style={{ textDecoration: 'none' }}>
                        <Card className="action-card">
                            <div className="action-icon">👷</div>
                            <h4>Manage Installers</h4>
                            <p className="text-muted">Add and manage installer accounts</p>
                        </Card>
                    </Link>

                    <Link to="/manage-vendor-entities" style={{ textDecoration: 'none' }}>
                        <Card className="action-card">
                            <div className="action-icon">🏢</div>
                            <h4>Vendor Companies</h4>
                            <p className="text-muted">Manage vendor companies</p>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Recent Installations */}
            <div className="dashboard-section">
                <h3>Recent Installations</h3>
                <Card>
                    {recentInstallations.length > 0 ? (
                        <div className="installations-list">
                            {recentInstallations.map((installation) => (
                                <div
                                    key={installation.id || installation._id}
                                    className="installation-item"
                                    onClick={() => setSelectedInstallation(installation)}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#2d3748';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <div className="installation-info">
                                        <div className="installation-meter">{installation.meterSerialNumber}</div>
                                        <div className="installation-consumer text-muted">{installation.consumerName}</div>
                                    </div>
                                    <div className="installation-meta text-muted">
                                        {installation.installerName} • {new Date(installation.installationDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center">No recent installations</p>
                    )}
                </Card>
            </div>

            {/* Vendors Summary */}
            <div className="dashboard-section">
                <h3>Active Vendor Companies ({vendors.length})</h3>
                <div className="vendors-grid">
                    {vendors.map((vendor) => (
                        <Card key={vendor.id || vendor._id} className="vendor-card">
                            <div className="vendor-name">{vendor.name}</div>
                            <div className="vendor-stats">
                                <span className="text-muted">Assigned: </span>
                                <span className="vendor-count">{vendor.assignedMetersCount || 0}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

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
                }} onClick={() => setSelectedInstallation(null)}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        background: '#1a1d29',
                        borderRadius: '12px',
                        border: '1px solid #2d3748',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                    }} onClick={(e: any) => e.stopPropagation()}>
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid #2d3748',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#e2e8f0' }}>Installation Details</h3>
                            <button onClick={() => setSelectedInstallation(null)} style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.75rem',
                                cursor: 'pointer',
                                color: '#a0aec0',
                                lineHeight: 1,
                                padding: 0
                            }}>×</button>
                        </div>

                        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflow: 'auto' }}>
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

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ background: '#252936', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ color: '#a0aec0', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        👤 CONSUMER
                                    </div>
                                    <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{selectedInstallation.consumerName}</div>
                                    <div style={{ color: '#718096', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        {selectedInstallation.consumerAddress}
                                    </div>
                                </div>

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

                                <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                    <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.375rem' }}>📅 DATE & TIME</div>
                                    <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                                        {new Date(selectedInstallation.installationDate).toLocaleString()}
                                    </div>
                                </div>

                                {selectedInstallation.gpsLocation && (
                                    <div style={{ background: '#252936', padding: '0.875rem', borderRadius: '8px' }}>
                                        <div style={{ color: '#a0aec0', fontSize: '0.7rem', marginBottom: '0.375rem' }}>📍 LOCATION</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                                            {selectedInstallation.gpsLocation.latitude?.toFixed(6)}, {selectedInstallation.gpsLocation.longitude?.toFixed(6)}
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
                    </div>
                </div>
            )}
        </div>
    );
};
