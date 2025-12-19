import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeterContext } from '../context/MeterContext';
import { Card, Button, Input, Select } from '../components/ui';
import { UserRole } from '../types';
import './ManageVendors.css';

export const ManageVendors: React.FC = () => {
    const { users, addVendor, updateVendor, deleteVendor } = useAuth();
    const { vendors } = useMeterContext();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        vendorId: '',
    });
    const [message, setMessage] = useState('');

    const vendorUsers = users.filter(u => u.role === UserRole.VENDOR);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.username || !formData.vendorId) {
            setMessage('❌ Please fill all fields');
            return;
        }

        // Check if username already exists
        const usernameExists = users.some(u =>
            u.username === formData.username && u.id !== editingId
        );

        if (usernameExists) {
            setMessage('❌ Username already exists');
            return;
        }

        if (editingId) {
            updateVendor(editingId, formData);
            setMessage('✅ Vendor updated successfully');
        } else {
            addVendor(formData);
            setMessage('✅ Vendor added successfully');
        }

        // Reset form
        setFormData({ name: '', username: '', vendorId: '' });
        setShowForm(false);
        setEditingId(null);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleEdit = (vendor: any) => {
        setFormData({
            name: vendor.name,
            username: vendor.username,
            vendorId: vendor.vendorId || '',
        });
        setEditingId(vendor.id);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this vendor?')) {
            deleteVendor(id);
            setMessage('✅ Vendor deleted successfully');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', username: '', vendorId: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const getVendorName = (vendorId?: string) => {
        const vendor = vendors.find(v => v.id === vendorId);
        return vendor?.name || 'Not linked';
    };

    return (
        <div className="manage-vendors fade-in">
            <div className="page-header">
                <div>
                    <h2>Manage Vendors</h2>
                    <p className="text-muted">Add, edit, and manage vendor accounts</p>
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
                    <h3>{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h3>
                    <form onSubmit={handleSubmit} className="vendor-form">
                        <Input
                            label="Vendor Company Name *"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., PowerGrid Corp"
                        />
                        <Input
                            label="Username *"
                            name="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="e.g., vendor1"
                        />
                        <Select
                            label="Link to Existing Vendor *"
                            name="vendorId"
                            value={formData.vendorId}
                            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                            options={vendors.map(v => ({ value: v.id, label: v.name }))}
                        />
                        <div className="form-actions">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                {editingId ? 'Update' : 'Add'} Vendor
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="vendors-list-card">
                <h3>Current Vendors ({vendorUsers.length})</h3>
                {vendorUsers.length > 0 ? (
                    <div className="vendors-table">
                        <div className="table-header">
                            <div>Company Name</div>
                            <div>Username</div>
                            <div>Linked Vendor</div>
                            <div>ID</div>
                            <div>Actions</div>
                        </div>
                        {vendorUsers.map((vendor) => (
                            <div key={vendor.id} className="table-row">
                                <div className="vendor-name">
                                    <span className="vendor-icon">🏢</span>
                                    {vendor.name}
                                </div>
                                <div className="vendor-username">{vendor.username}</div>
                                <div className="vendor-linked">{getVendorName(vendor.vendorId)}</div>
                                <div className="vendor-id">{vendor.id}</div>
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
                    </div>
                ) : (
                    <div className="no-vendors">
                        <div className="no-vendors-icon">🏢</div>
                        <p>No vendors added yet</p>
                        <p className="text-muted">Click "Add New Vendor" to get started</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
