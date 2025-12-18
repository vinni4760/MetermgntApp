import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/ui';
import { UserRole } from '../types';
import './ManageInstallers.css';

export const ManageInstallers: React.FC = () => {
    const { users, addInstaller, updateInstaller, deleteInstaller } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
    });
    const [message, setMessage] = useState('');

    const installers = users.filter(u => u.role === UserRole.INSTALLER);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.username) {
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
            updateInstaller(editingId, formData);
            setMessage('✅ Installer updated successfully');
        } else {
            addInstaller(formData);
            setMessage('✅ Installer added successfully');
        }

        // Reset form
        setFormData({ name: '', username: '' });
        setShowForm(false);
        setEditingId(null);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleEdit = (installer: any) => {
        setFormData({
            name: installer.name,
            username: installer.username,
        });
        setEditingId(installer.id);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this installer?')) {
            deleteInstaller(id);
            setMessage('✅ Installer deleted successfully');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', username: '' });
        setEditingId(null);
        setShowForm(false);
    };

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
