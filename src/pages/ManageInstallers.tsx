import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { Card, Button, Input } from '../components/ui';
import './ManageInstallers.css';

export const ManageInstallers: React.FC = () => {
    const [installers, setInstallers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });
    const [message, setMessage] = useState('');

    // Fetch installers
    const fetchInstallers = async () => {
        try {
            const response = await usersAPI.getAll();
            const installerUsers = response.data.filter((u: any) => u.role === 'INSTALLER');
            setInstallers(installerUsers);
        } catch (error) {
            console.error('Failed to fetch installers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstallers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.username) {
            setMessage('❌ Please fill all required fields');
            return;
        }

        if (!editingId && !formData.password) {
            setMessage('❌ Password is required for new installers');
            return;
        }

        try {
            if (editingId) {
                // Update existing installer
                const updates: any = { name: formData.name, username: formData.username };
                if (formData.password) updates.password = formData.password;

                await usersAPI.update(editingId, updates);
                setMessage('✅ Installer updated successfully');
            } else {
                // Create new installer
                await usersAPI.create({
                    ...formData,
                    role: 'INSTALLER'
                });
                setMessage('✅ Installer added successfully');
            }

            // Reset form and refresh list
            setFormData({ name: '', username: '', password: '' });
            setShowForm(false);
            setEditingId(null);
            fetchInstallers();
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.error || 'Operation failed'}`);
        }
    };

    const handleEdit = (installer: any) => {
        setFormData({
            name: installer.name,
            username: installer.username,
            password: '',
        });
        setEditingId(installer.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this installer?')) return;

        try {
            await usersAPI.delete(id);
            setMessage('✅ Installer deleted successfully');
            fetchInstallers();
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.error || 'Delete failed'}`);
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', username: '', password: '' });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return <div className="manage-installers"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="manage-installers fade-in">
            <div className="page-header">
                <div>
                    <h2>Manage Installers</h2>
                    <p className="text-muted">Add, edit, and manage field installer accounts</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} variant="primary">
                        ➕ Add New Installer
                    </Button>
                )}
            </div>

            {message && (
                <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
                    {message}
                </div>
            )}

            {showForm && (
                <Card className="installer-form-card">
                    <h3>{editingId ? 'Edit Installer' : 'Add New Installer'}</h3>
                    <form onSubmit={handleSubmit} className="installer-form">
                        <Input
                            label="Full Name *"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Rajesh Kumar"
                        />
                        <Input
                            label="Username *"
                            name="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="e.g., rajesh"
                        />
                        <Input
                            label={editingId ? "Password (leave blank to keep current)" : "Password *"}
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter password"
                        />
                        <div className="form-actions">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                {editingId ? 'Update' : 'Add'} Installer
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="installers-list-card">
                <h3>Current Installers ({installers.length})</h3>
                {installers.length > 0 ? (
                    <div className="installers-table">
                        <div className="table-header">
                            <div>Name</div>
                            <div>Username</div>
                            <div>ID</div>
                            <div>Actions</div>
                        </div>
                        {installers.map((installer) => (
                            <div key={installer.id} className="table-row">
                                <div className="installer-name">
                                    <span className="installer-icon">🔧</span>
                                    {installer.name}
                                </div>
                                <div className="installer-username">{installer.username}</div>
                                <div className="installer-id">{installer.id}</div>
                                <div className="table-actions">
                                    <button
                                        className="action-button edit-button"
                                        onClick={() => handleEdit(installer)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="action-button delete-button"
                                        onClick={() => handleDelete(installer.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-installers">
                        <div className="no-installers-icon">👥</div>
                        <p>No installers added yet</p>
                        <p className="text-muted">Click "Add New Installer" to get started</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
