import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { metersAPI, vendorsAPI, installationsAPI } from '../services/api';
import { Button, Card, Input, TextArea, Select } from '../components/ui';
import { InstallationStatus, UserRole } from '../types';
import { mockInstallers } from '../utils/mockData';
import './DailyInstallation.css';

export const DailyInstallation: React.FC = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [meters, setMeters] = useState<any[]>([]);
    const [installations, setInstallations] = useState<any[]>([]);
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        installerName: '',
        vendorName: '',
        meterSerialNumber: '',
        consumerName: '',
        consumerAddress: '',
        oldMeterReading: '',
        newMeterReading: '',
        status: InstallationStatus.IN_TRANSIT,
    });
    const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [photoFiles, setPhotoFiles] = useState<{ before: FileList | null; after: FileList | null }>({
        before: null,
        after: null,
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch vendors, meters, and installations from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendorsRes, metersRes, installationsRes] = await Promise.all([
                    vendorsAPI.getAll(),
                    metersAPI.getAll(),
                    installationsAPI.getAll()
                ]);
                setVendors(vendorsRes.data);
                setMeters(metersRes.data);

                // Filter installations for current installer if logged in as installer
                if (user?.role === UserRole.INSTALLER) {
                    const myInstallations = installationsRes.data.filter(
                        (i: any) => i.installerName === user.name
                    );
                    setInstallations(myInstallations);
                } else {
                    setInstallations(installationsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, [user]);

    // Auto-fill installer name if logged in as installer
    useEffect(() => {
        if (user?.role === UserRole.INSTALLER) {
            setFormData(prev => ({
                ...prev,
                installerName: user.name
            }));
        }
    }, [user]);



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Clear meter selection when vendor changes
        if (name === 'vendorName') {
            setFormData({
                ...formData,
                vendorName: value,
                meterSerialNumber: '', // Reset meter when vendor changes
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const captureGPS = () => {
        setLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGpsLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setMessage('✅ GPS location captured successfully');
                    setLoading(false);
                    setTimeout(() => setMessage(''), 3000);
                },
                (error) => {
                    setMessage(`❌ GPS Error: ${error.message}`);
                    setLoading(false);
                    // Fallback to mock location
                    setGpsLocation({
                        latitude: 19.0760,
                        longitude: 72.8777,
                    });
                }
            );
        } else {
            setMessage('❌ Geolocation not supported');
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (installationId: string, newStatus: string) => {
        try {
            setLoading(true);
            await installationsAPI.update(installationId, { status: newStatus });

            setMessage('✅ Installation status updated successfully!');

            // Refresh installations list
            const installationsRes = await installationsAPI.getAll();
            if (user?.role === UserRole.INSTALLER) {
                const myInstallations = installationsRes.data.filter(
                    (i: any) => i.installerName === user.name
                );
                setInstallations(myInstallations);
            } else {
                setInstallations(installationsRes.data);
            }

            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.error || 'Failed to update installation'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.installerName || !formData.meterSerialNumber || !formData.consumerName || !gpsLocation) {
            setMessage('❌ Please fill all required fields and capture GPS location');
            return;
        }

        try {
            await installationsAPI.create({
                ...formData,
                gpsLocation: {
                    latitude: gpsLocation.latitude,
                    longitude: gpsLocation.longitude
                },
                installationDate: new Date().toISOString(),
                photosBefore: [],
                photosAfter: [],
            });

            setMessage('✅ Installation logged successfully!');

            // Reset form
            setFormData({
                installerName: user?.name || '',
                vendorName: '',
                meterSerialNumber: '',
                consumerName: '',
                consumerAddress: '',
                oldMeterReading: '',
                newMeterReading: '',
                status: InstallationStatus.IN_TRANSIT,
            });
            setGpsLocation(null);
            setPhotoFiles({ before: null, after: null });

            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.error || 'Failed to save installation'}`);
        }
    };

    return (
        <div className="daily-installation fade-in">
            <div className="page-header">
                <div>
                    <h2>Daily Meter Installation</h2>
                    <p className="text-muted">Log meter installation details and submit for verification</p>
                </div>
            </div>

            <Card className="installation-form-container">
                <h3>Meter Installation Form</h3>

                <form onSubmit={handleSubmit} className="installation-form">
                    <div className="form-grid">
                        {user?.role === UserRole.INSTALLER ? (
                            <Input
                                label="Installer Name *"
                                name="installerName"
                                value={formData.installerName}
                                disabled
                            />
                        ) : (
                            <Select
                                label="Installer Name *"
                                name="installerName"
                                value={formData.installerName}
                                onChange={handleInputChange}
                                options={mockInstallers.map(i => ({ value: i.name, label: i.name }))}
                            />
                        )}

                        <Select
                            label="Vendor Name *"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleInputChange}
                            options={[
                                { value: '', label: 'Select Vendor First...' },
                                ...vendors.map(v => ({ value: v.name, label: v.name }))
                            ]}
                        />

                        <Select
                            label="Meter Serial Number *"
                            name="meterSerialNumber"
                            value={formData.meterSerialNumber}
                            onChange={handleInputChange}
                            disabled={!formData.vendorName}
                            options={[
                                { value: '', label: formData.vendorName ? 'Select Meter...' : 'Select Vendor First' },
                                ...meters
                                    .filter(m => {
                                        // Find the vendor object
                                        const vendor = vendors.find(v => v.name === formData.vendorName);
                                        if (!vendor) return false;

                                        // Check if meter belongs to selected vendor AND is AVAILABLE
                                        const vendorMatches = m.vendorId?._id === vendor._id || m.vendorId?.id === vendor._id || m.vendorId === vendor._id;
                                        const isAvailable = m.status === 'AVAILABLE';

                                        return vendorMatches && isAvailable;
                                    })
                                    .map(m => ({
                                        value: m.serialNumber,
                                        label: `${m.serialNumber} - Available`
                                    }))
                            ]}
                        />

                        <Input
                            label="Consumer Name *"
                            name="consumerName"
                            value={formData.consumerName}
                            onChange={handleInputChange}
                            placeholder="Enter consumer name"
                        />

                        <div className="form-full-width">
                            <TextArea
                                label="Consumer Address *"
                                name="consumerAddress"
                                value={formData.consumerAddress}
                                onChange={handleInputChange}
                                placeholder="Enter complete address"
                                rows={3}
                            />
                        </div>

                        <div className="gps-section form-full-width">
                            <label className="input-label">GPS Location (Auto) *</label>
                            <div className="gps-capture">
                                <Button
                                    type="button"
                                    onClick={captureGPS}
                                    variant="outline"
                                    disabled={loading}
                                >
                                    {loading ? '📍 Capturing...' : gpsLocation ? '✓ Location Captured' : '📍 Capture GPS Location'}
                                </Button>
                                {gpsLocation && (
                                    <div className="gps-coordinates">
                                        <span className="text-muted">
                                            Lat: {gpsLocation.latitude.toFixed(6)}, Lng: {gpsLocation.longitude.toFixed(6)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Input
                            label="Installation Date & Time"
                            type="datetime-local"
                            value={new Date().toISOString().slice(0, 16)}
                            disabled
                        />

                        <Input
                            label="Old Meter Reading (if applicable)"
                            name="oldMeterReading"
                            value={formData.oldMeterReading}
                            onChange={handleInputChange}
                            placeholder="Enter old reading"
                        />

                        <Input
                            label="New Meter Reading *"
                            name="newMeterReading"
                            value={formData.newMeterReading}
                            onChange={handleInputChange}
                            placeholder="0"
                        />

                        <Select
                            label="Installation Status *"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            options={[
                                { value: InstallationStatus.IN_TRANSIT, label: 'In Transit' },
                                { value: InstallationStatus.INSTALLED, label: 'Installed' },
                            ]}
                        />

                        <div className="form-full-width">
                            <label className="input-label">Photo Upload (Before/After)</label>
                            <div className="photo-upload-grid">
                                <div className="photo-upload-box">
                                    <label className="upload-label">📷 Before</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setPhotoFiles({ ...photoFiles, before: e.target.files })}
                                        className="file-input"
                                    />
                                    {photoFiles.before && (
                                        <div className="text-muted">{photoFiles.before.length} file(s) selected</div>
                                    )}
                                </div>
                                <div className="photo-upload-box">
                                    <label className="upload-label">📷 After</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setPhotoFiles({ ...photoFiles, after: e.target.files })}
                                        className="file-input"
                                    />
                                    {photoFiles.after && (
                                        <div className="text-muted">{photoFiles.after.length} file(s) selected</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
                            {message}
                        </div>
                    )}

                    <div className="form-actions">
                        <Button type="submit" variant="primary" size="lg">
                            Submit Installation
                        </Button>
                    </div>
                </form>
            </Card>

            {/* My Installations List */}
            {installations.length > 0 && (
                <Card className="installation-form-container">
                    <h3 style={{ marginTop: '0' }}>My Installations ({installations.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem' }}>Meter Serial</th>
                                    <th style={{ padding: '0.75rem' }}>Consumer</th>
                                    <th style={{ padding: '0.75rem' }}>Vendor</th>
                                    <th style={{ padding: '0.75rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem' }}>Date</th>
                                    <th style={{ padding: '0.75rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {installations.map((installation: any) => (
                                    <tr key={installation._id || installation.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{installation.meterSerialNumber}</td>
                                        <td style={{ padding: '0.75rem' }}>{installation.consumerName}</td>
                                        <td style={{ padding: '0.75rem' }}>{installation.vendorName}</td>
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
                                        <td style={{ padding: '0.75rem' }}>
                                            {installation.status === 'IN_TRANSIT' && (
                                                <Button
                                                    onClick={() => handleUpdateStatus(installation._id || installation.id, 'INSTALLED')}
                                                    variant="primary"
                                                    size="sm"
                                                    disabled={loading}
                                                >
                                                    Mark as Installed
                                                </Button>
                                            )}
                                            {installation.status === 'INSTALLED' && (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Complete</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
