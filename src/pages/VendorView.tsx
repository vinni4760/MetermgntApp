import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { metersAPI, vendorsAPI, installationsAPI } from '../services/api';
import { Button, Card } from '../components/ui';
import './VendorView.css';

export const VendorView: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [meters, setMeters] = useState<any[]>([]);
    const [installations, setInstallations] = useState<any[]>([]);
    const [vendorCompany, setVendorCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedInstallation, setSelectedInstallation] = useState<any>(null);
    const [metersPage, setMetersPage] = useState(1);
    const [installationsPage, setInstallationsPage] = useState(1);
    const METERS_PER_PAGE = 12;
    const INSTALLATIONS_PER_PAGE = 15;

    useEffect(() => {
        const fetchData = async () => {
            console.log('Full user object:', JSON.stringify(user, null, 2));

            if (!user?.vendorId) {
                console.log('No vendorId found');
                setLoading(false);
                return;
            }

            // Extract vendorId properly - handle if it's an object
            let vendorIdString = user.vendorId;
            if (typeof vendorIdString === 'object' && vendorIdString !== null) {
                vendorIdString = (vendorIdString as any)._id || (vendorIdString as any).id || String(vendorIdString);
            }

            console.log('Using vendorId string:', vendorIdString);

            try {
                // Fetch vendor company details
                const vendorsResponse = await vendorsAPI.getAll();
                console.log('All vendors:', vendorsResponse.data);

                const company = vendorsResponse.data.find((v: any) =>
                    v._id === vendorIdString || v.id === vendorIdString
                );
                console.log('Matched vendor company:', company);
                setVendorCompany(company);

                // Fetch meters for this vendor
                console.log('Fetching meters for vendorId:', vendorIdString);
                const metersResponse = await metersAPI.getByVendor(vendorIdString);
                console.log('Meters response:', metersResponse);
                setMeters(metersResponse.data || []);

                // Fetch installations and filter by vendor's meters
                const installationsResponse = await installationsAPI.getAll();
                const meterSerials = (metersResponse.data || []).map((m: any) => m.serialNumber);
                const vendorInstallations = installationsResponse.data.filter(
                    (i: any) => meterSerials.includes(i.meterSerialNumber)
                );
                console.log('Vendor installations:', vendorInstallations.length);
                setInstallations(vendorInstallations);
            } catch (error: any) {
                console.error('Error details:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setInstallationsPage(1);
    }, [statusFilter]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="vendor-view">
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading vendor dashboard...</p>
                </div>
            </div>
        );
    }

    const availableMeters = meters.filter(m => m.status === 'AVAILABLE');
    const installedMeters = meters.filter(m => m.status === 'INSTALLED');

    // Pagination for meters
    const totalMetersPages = Math.ceil(meters.length / METERS_PER_PAGE);
    const paginatedMeters = meters.slice(
        (metersPage - 1) * METERS_PER_PAGE,
        metersPage * METERS_PER_PAGE
    );

    // Filter installations by status
    const filteredInstallations = statusFilter === 'all'
        ? installations
        : installations.filter(i => i.status === statusFilter);

    // Pagination for installations
    const totalInstallationsPages = Math.ceil(filteredInstallations.length / INSTALLATIONS_PER_PAGE);
    const paginatedInstallations = filteredInstallations.slice(
        (installationsPage - 1) * INSTALLATIONS_PER_PAGE,
        installationsPage * INSTALLATIONS_PER_PAGE
    );



    return (
        <div className="vendor-view">
            <div className="vendor-header">
                <div className="vendor-header-content">
                    <div className="vendor-logo">🏢</div>
                    <div>
                        <h1>{vendorCompany?.name || user?.name || 'Vendor'}</h1>
                        <p className="text-muted">
                            {vendorCompany ? `${user?.name} - Vendor Dashboard` : 'Vendor Dashboard'}
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleLogout} size="sm">
                    Logout
                </Button>
            </div>

            <div className="vendor-stats">
                <Card className="stat-card-vendor">
                    <div className="stat-value-vendor">{meters.length}</div>
                    <div className="stat-label-vendor">Total Assigned Meters</div>
                </Card>
                <Card className="stat-card-vendor">
                    <div className="stat-value-vendor">{availableMeters.length}</div>
                    <div className="stat-label-vendor">Available</div>
                </Card>
                <Card className="stat-card-vendor">
                    <div className="stat-value-vendor">{installedMeters.length}</div>
                    <div className="stat-label-vendor">Installed</div>
                </Card>
            </div>

            <Card className="vendor-section-card">
                <h3>Assigned Meters ({meters.length})</h3>
                {meters.length > 0 ? (
                    <>
                        <div className="meters-grid">
                            {paginatedMeters.map((meter: any) => (
                                <div key={meter.id || meter._id} className="meter-item-vendor" style={{
                                    padding: '1rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-card)'
                                }}>
                                    <div className="meter-serial" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {meter.serialNumber}
                                    </div>
                                    <div style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        background: meter.status === 'AVAILABLE' ? 'var(--success)' : 'var(--info)',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        display: 'inline-block'
                                    }}>
                                        {meter.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalMetersPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setMetersPage(p => Math.max(1, p - 1))}
                                    disabled={metersPage === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: metersPage === 1 ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                        color: metersPage === 1 ? 'var(--text-secondary)' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: metersPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    ← Previous
                                </button>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    Page {metersPage} of {totalMetersPages}
                                </span>
                                <button
                                    onClick={() => setMetersPage(p => Math.min(totalMetersPages, p + 1))}
                                    disabled={metersPage === totalMetersPages}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: metersPage === totalMetersPages ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                        color: metersPage === totalMetersPages ? 'var(--text-secondary)' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: metersPage === totalMetersPages ? 'not-allowed' : 'pointer',
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
                        <div className="no-data-icon">📦</div>
                        <p>No meters assigned yet</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            Contact admin to assign meters to your company
                        </p>
                    </div>
                )}
            </Card>

            {/* Installations Section */}
            <Card className="vendor-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Installations ({installations.length})</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setStatusFilter('all')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: statusFilter === 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                color: statusFilter === 'all' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            All ({installations.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('IN_TRANSIT')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: statusFilter === 'IN_TRANSIT' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                color: statusFilter === 'IN_TRANSIT' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            In Transit ({installations.filter(i => i.status === 'IN_TRANSIT').length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('INSTALLED')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: statusFilter === 'INSTALLED' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                color: statusFilter === 'INSTALLED' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            Installed ({installations.filter(i => i.status === 'INSTALLED').length})
                        </button>
                    </div>
                </div>

                {filteredInstallations.length > 0 ? (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem' }}>Meter Serial</th>
                                        <th style={{ padding: '0.75rem' }}>Consumer</th>
                                        <th style={{ padding: '0.75rem' }}>Address</th>
                                        <th style={{ padding: '0.75rem' }}>Installer</th>
                                        <th style={{ padding: '0.75rem' }}>Status</th>
                                        <th style={{ padding: '0.75rem' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedInstallations.map((installation: any) => (
                                        <tr
                                            key={installation._id || installation.id}
                                            onClick={() => setSelectedInstallation(installation)}
                                            style={{
                                                borderBottom: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--bg-tertiary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{installation.meterSerialNumber}</td>
                                            <td style={{ padding: '0.75rem' }}>{installation.consumerName}</td>
                                            <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {installation.consumerAddress}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>{installation.installerName}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: installation.status === 'INSTALLED' ? 'var(--success)' : 'var(--warning)',
                                                    color: 'white',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {installation.status === 'IN_TRANSIT' ? 'In Transit' : 'Installed'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Date(installation.installationDate || installation.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalInstallationsPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setInstallationsPage(p => Math.max(1, p - 1))}
                                    disabled={installationsPage === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: installationsPage === 1 ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                        color: installationsPage === 1 ? 'var(--text-secondary)' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: installationsPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    ← Previous
                                </button>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    Page {installationsPage} of {totalInstallationsPages}
                                </span>
                                <button
                                    onClick={() => setInstallationsPage(p => Math.min(totalInstallationsPages, p + 1))}
                                    disabled={installationsPage === totalInstallationsPages}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: installationsPage === totalInstallationsPages ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                        color: installationsPage === totalInstallationsPages ? 'var(--text-secondary)' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: installationsPage === totalInstallationsPages ? 'not-allowed' : 'pointer',
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
                        <div className="no-data-icon">📍</div>
                        <p>No installations found</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            {statusFilter === 'all'
                                ? 'No installations have been created yet'
                                : `No installations with status: ${statusFilter === 'IN_TRANSIT' ? 'In Transit' : 'Installed'}`
                            }
                        </p>
                    </div>
                )}
            </Card>

            {/* Modal for installation details */}
            {selectedInstallation && (
                <div
                    onClick={() => setSelectedInstallation(null)}
                    style={{
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
                        padding: '1rem',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#1a1d2e',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Installation Details</h3>
                            <button
                                onClick={() => setSelectedInstallation(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    padding: '0',
                                    lineHeight: 1
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Meter Serial</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedInstallation.meterSerialNumber}</div>
                                </div>
                                <span style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    background: selectedInstallation.status === 'INSTALLED' ? 'var(--success)' : 'var(--warning)',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {selectedInstallation.status === 'IN_TRANSIT' ? 'In Transit' : 'Installed'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Consumer Name</div>
                                <div style={{ fontWeight: 500 }}>{selectedInstallation.consumerName}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Installer</div>
                                <div>{selectedInstallation.installerName}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Consumer Address</div>
                                <div>{selectedInstallation.consumerAddress}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Installation Date</div>
                                <div>{new Date(selectedInstallation.installationDate || selectedInstallation.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</div>
                            </div>
                            {selectedInstallation.gpsLocation && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>GPS Location</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                            {selectedInstallation.gpsLocation.latitude.toFixed(6)}, {selectedInstallation.gpsLocation.longitude.toFixed(6)}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const lat = selectedInstallation.gpsLocation.latitude;
                                                const lng = selectedInstallation.gpsLocation.longitude;
                                                window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                            }}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                background: 'var(--accent-primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                transition: 'opacity 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            📍 View on Map
                                        </button>
                                    </div>
                                </div>
                            )}
                            {selectedInstallation.photosBefore && selectedInstallation.photosBefore.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>📷 Photos Before Installation</div>
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
                                                    border: '2px solid var(--border-color)',
                                                    transition: 'transform 0.2s, border-color 0.2s'
                                                }}
                                                onClick={() => window.open(url, '_blank')}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedInstallation.photosAfter && selectedInstallation.photosAfter.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>📷 Photos After Installation</div>
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
                                                    border: '2px solid var(--border-color)',
                                                    transition: 'transform 0.2s, border-color 0.2s'
                                                }}
                                                onClick={() => window.open(url, '_blank')}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedInstallation.newMeterReading && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Meter Reading</div>
                                    <div>{selectedInstallation.newMeterReading}</div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedInstallation(null)}
                            style={{
                                width: '100%',
                                marginTop: '1.5rem',
                                padding: '0.75rem',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
