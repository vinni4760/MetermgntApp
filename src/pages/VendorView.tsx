import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { metersAPI, vendorsAPI } from '../services/api';
import { Button, Card } from '../components/ui';
import './VendorView.css';

export const VendorView: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [meters, setMeters] = useState<any[]>([]);
    const [vendorCompany, setVendorCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                    <div className="meters-grid">
                        {meters.slice(0, 50).map((meter: any) => (
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
                        {meters.length > 50 && (
                            <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center' }}>
                                Showing 50 of {meters.length} meters
                            </p>
                        )}
                    </div>
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
        </div>
    );
};
