import React, { useState, useEffect } from 'react';
import { vendorsAPI } from '../services/api';
import { Card, Button, Input } from '../components/ui';
import './ManageVendorEntities.css';

export const ManageVendorEntities: React.FC = () => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        email: '',
    });
    const [message, setMessage] = useState('');

    // Fetch vendors
    const fetchVendors = async () => {
        try {
            const response = await vendorsAPI.getAll();
            setVendors(response.data);
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

        if (!formData.name || !formData.contactNumber || !formData.email) {
            setMessage('❌ Please fill all required fields');
            return;
        }

        try {
            if (editingId) {
                await vendorsAPI.update(editingId, formData);
                setMessage('✅ Vendor company updated successfully');
            } else {
                await vendorsAPI.create(formData);
                setMessage('✅ Vendor company added successfully');
            }

            setFormData({ name: '', contactNumber: '', email: '' });
            setShowForm(false);
            setEditingId(null);
            fetchVendors();
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.error || 'Operation failed'}`);
        }
    };

    const handleEdit = (vendor: any) => {
        setFormData({
            name: vendor.name,
            contactNumber: vendor.contactNumber,
            email: vendor.email,
        });
        setEditingId(vendor._id || vendor.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vendor company? This will affect all users linked to this vendor.')) return;

        try {
            await vendorsAPI.delete(id);
            setMessage('✅ Vendor company deleted successfully');
            fetchVendors();
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.error || 'Delete failed'}`);
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', contactNumber: '', email: '' });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return <div className="manage-vendor-entities"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="manage-vendor-entities fade-in">
            <div className="page-header">
                <div>
                    <h2>Manage Vendor Companies</h2>
                    <p className="text-muted">Add, edit, and manage vendor company entities</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} variant="primary">
                        ➕ Add New Vendor Company
                    </Button>
                )}
            </div>

            {message && (
                <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
                    {message}
                </div>
            )}

            {showForm && (
                <Card className="vendor-entity-form-card">
                    <h3>{editingId ? 'Edit Vendor Company' : 'Add New Vendor Company'}</h3>
                    <form onSubmit={handleSubmit} className="vendor-entity-form">
                        <Input
                            label="Company Name *"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., PowerGrid Corp"
                        />
                        <Input
                            label="Contact Number *"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                            placeholder="e.g., 9876543210"
                        />
                        <Input
                            label="Email *"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="e.g., contact@powergrid.com"
                        />
                        <div className="form-actions">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                {editingId ? 'Update' : 'Add'} Vendor Company
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="vendor-entities-list-card">
                <h3>Vendor Companies ({vendors.length})</h3>
                {vendors.length > 0 ? (
                    <div className="vendor-entities-table">
                        <div className="table-header">
                            <div>Company Name</div>
                            <div>Contact Number</div>
                            <div>Email</div>
                            <div>Meters Assigned</div>
                            <div>Actions</div>
                        </div>
                        {vendors.map((vendor) => (
                            <div key={vendor._id || vendor.id} className="table-row">
                                <div className="vendor-name">
                                    <span className="vendor-icon">🏢</span>
                                    {vendor.name}
                                </div>
                                <div className="vendor-contact">{vendor.contactNumber}</div>
                                <div className="vendor-email">{vendor.email}</div>
                                <div className="vendor-meters">{vendor.assignedMetersCount || 0}</div>
                                <div className="table-actions">
                                    <button
                                        className="action-button edit-button"
                                        onClick={() => handleEdit(vendor)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="action-button delete-button"
                                        onClick={() => handleDelete(vendor._id || vendor.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-vendors">
                        <div className="no-vendors-icon">🏢</div>
                        <p>No vendor companies added yet</p>
                        <p className="text-muted">Click "Add New Vendor Company" to get started</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
