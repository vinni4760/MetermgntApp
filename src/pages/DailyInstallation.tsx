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

    // Fetch vendors and meters from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendorsRes, metersRes] = await Promise.all([
                    vendorsAPI.getAll(),
                    metersAPI.getAll()
                ]);
                setVendors(vendorsRes.data);
                setMeters(metersRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);

    // Auto-fill installer name if logged in as installer
    useEffect(() => {
        if (user?.role === UserRole.INSTALLER) {
            setFormData(prev => ({
                ...prev,
                installerName: user.name
            }));
        }
    }, [user]);

    // Filter meters that are assigned to vendors
    const assignedMeters = meters.filter(m => m.vendorId);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
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
                            label="Vendor Name"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleInputChange}
                            options={[
                                { value: '', label: 'Select...' },
                                ...vendors.map(v => ({ value: v.name, label: v.name }))
                            ]}
                        />

                        <Select
                            label="Meter Serial Number *"
                            name="meterSerialNumber"
                            value={formData.meterSerialNumber}
                            onChange={handleInputChange}
                            options={[
                                { value: '', label: 'Select...' },
                                ...assignedMeters.map(m => ({ value: m.serialNumber, label: m.serialNumber }))
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
        </div>
    );
};
