import React, { useState, useEffect, useRef } from 'react';
import { usersAPI, vendorsAPI } from '../services/api';
import { Card, Button, Input } from '../components/ui';
import './ManageVendors.css';

export const ManageVendors: React.FC = () => {
    const [vendorUsers, setVendorUsers] = useState<any[]>([]);
    const [vendorEntities, setVendorEntities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        vendorId: '',
        email: '',
    });
    const [message, setMessage] = useState('');
    const messageTimeoutRef = useRef<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const VENDORS_PER_PAGE = 10;

    // Fetch vendors
    const fetchVendors = async () => {
        try {
            const [usersResponse, vendorsResponse] = await Promise.all([
                usersAPI.getAll(),
                vendorsAPI.getAll()
            ]);

            const vendors = usersResponse.data.filter((u: any) => u.role === 'VENDOR');
            setVendorUsers(vendors);
            setVendorEntities(vendorsResponse.data);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (submitting) return; // Prevent double-submit

        if (!formData.name || !formData.username || !formData.vendorId) {
            setMessage('❌ Please fill all required fields');
            return;
        }

        if (!editingId && !formData.password) {
            setMessage('❌ Password is required for new vendors');
            return;
        }

        try {
            if (editingId) {
                // Update existing vendor
                const updates: any = {
                    name: formData.name,
                    username: formData.username,
                    vendorId: formData.vendorId
                };
                if (formData.password) updates.password = formData.password;

                await usersAPI.update(editingId, updates);
                setMessage('✅ Vendor updated successfully');
            } else {
                // Create new vendor
                const response = await usersAPI.create({
                    ...formData,
                    role: 'VENDOR'
                });

                // Show success message based on email sent status
                if (response.emailSent) {
                    setMessage(`✅ Vendor added successfully! Credentials sent to ${formData.email}`);
                } else {
                    setMessage(`✅ Success! ${formData.name} has been added as a vendor user. Note: Email service not configured, please share credentials manually.`);
                }
            }

            // Reset form and refresh list
            setFormData({ name: '', username: '', password: '', vendorId: '', email: '' });
            setShowForm(false);
            setEditingId(null);
            await fetchVendors();

            // Clear any existing timeout and set new one
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
            messageTimeoutRef.current = setTimeout(() => setMessage(''), 5000);
        } catch (error: any) {
            // Clear any success message timeout
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
            setMessage(`❌ ${error.response?.data?.error || 'Operation failed'}`);
            // Error messages persist longer
            messageTimeoutRef.current = setTimeout(() => setMessage(''), 5000);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (vendor: any) => {
        setFormData({
            name: vendor.name,
            username: vendor.username,
            password: '',
            vendorId: vendor.vendorId || '',
            email: vendor.email || '',
        });
        setEditingId(vendor.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vendor user?')) return;

        try {
            await usersAPI.delete(id);
            setMessage('✅ Vendor deleted successfully');
            fetchVendors();
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.error || 'Delete failed'}`);
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', username: '', password: '', vendorId: '', email: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const getVendorEntityName = (vendorId: string) => {
        const entity = vendorEntities.find(v => v._id === vendorId || v.id === vendorId);
        return entity ? entity.name : 'Unknown';
    };

    if (loading) {
        return <div className="manage-vendors"><div className="loading">Loading...</div></div>;
    }

    // Pagination
    const totalPages = Math.ceil(vendorUsers.length / VENDORS_PER_PAGE);
    const paginatedVendors = vendorUsers.slice(
        (currentPage - 1) * VENDORS_PER_PAGE,
        currentPage * VENDORS_PER_PAGE
    );

    return (
        <div className="manage-vendors fade-in">
            <div className="page-header">
                <div>
                    <h2>Manage Vendors</h2>
                    <p className="text-muted">Add, edit, and manage vendor user accounts</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} variant="primary">
                        ➕ Add New Vendor
                    </Button>
                )}
            </div>

            {message && (
                <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
                    {message}
                </div>
            )}

            {showForm && (
                <Card className="vendor-form-card">
                    <h3>{editingId ? 'Edit Vendor User' : 'Add New Vendor User'}</h3>
                    <form onSubmit={handleSubmit} className="vendor-form">
                        <Input
                            label="Full Name *"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., PowerGrid Corp User"
                        />
                        <Input
                            label="Username *"
                            name="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="e.g., vendor1"
                        />
                        <Input
                            label="Email *"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="vendor@example.com"
                        />
                        <Input
                            label={editingId ? "Password (leave blank to keep current)" : "Password *"}
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter password"
                        />
                        <div className="form-group">
                            <label>Vendor Entity *</label>
                            <select
                                value={formData.vendorId}
                                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                className="form-select"
                            >
                                <option value="">Select Vendor Entity</option>
                                {vendorEntities.map(v => (
                                    <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-actions">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={submitting}>
                                {submitting ? 'Saving...' : (editingId ? 'Update' : 'Add')} Vendor
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="vendors-list-card">
                <h3>Current Vendor Users ({vendorUsers.length})</h3>
                {vendorUsers.length > 0 ? (
                    <div className="vendors-table">
                        <div className="table-header">
                            <div>Name</div>
                            <div>Username</div>
                            <div>Vendor Entity</div>
                            <div>Actions</div>
                        </div>
                        {paginatedVendors.map((vendor) => (
                            <div key={vendor.id} className="table-row">
                                <div className="vendor-name">
                                    <span className="vendor-icon">🏢</span>
                                    {vendor.name}
                                </div>
                                <div className="vendor-username">{vendor.username}</div>
                                <div className="vendor-entity">{getVendorEntityName(vendor.vendorId)}</div>
                                <div className="table-actions">
                                    <button
                                        className="action-button edit-button"
                                        onClick={() => handleEdit(vendor)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="action-button delete-button"
                                        onClick={() => handleDelete(vendor.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {totalPages > 1 && (
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
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
                    </div>
                ) : (
                    <div className="no-vendors">
                        <div className="no-vendors-icon">🏢</div>
                        <p>No vendor users added yet</p>
                        <p className="text-muted">Click "Add New Vendor" to get started</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
