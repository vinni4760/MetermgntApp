import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/ui';
import { UserRole } from '../types';
import './Login.css';

export const Login: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, users } = useAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
            setError('Please select a user');
            return;
        }

        const success = login(selectedUser);
        if (success) {
            const user = users.find(u => u.username === selectedUser);
            // Redirect based on role
            if (user?.role === UserRole.ADMIN) {
                navigate('/');
            } else if (user?.role === UserRole.INSTALLER) {
                navigate('/installer');
            } else if (user?.role === UserRole.VENDOR) {
                navigate('/vendor');
            }
        } else {
            setError('Login failed');
        }
    };

    const adminUsers = users.filter(u => u.role === UserRole.ADMIN);
    const installerUsers = users.filter(u => u.role === UserRole.INSTALLER);
    const vendorUsers = users.filter(u => u.role === UserRole.VENDOR);

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-header">
                    <div className="login-logo">⚡</div>
                    <h1>Meter Management System</h1>
                    <p className="text-muted">Select your account to continue</p>
                </div>

                <Card className="login-card">
                    <form onSubmit={handleLogin}>
                        <div className="user-selection">
                            <h3>Admin Login</h3>
                            <div className="user-grid">
                                {adminUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className={`user-card ${selectedUser === user.username ? 'user-card-selected' : ''}`}
                                        onClick={() => setSelectedUser(user.username)}
                                    >
                                        <div className="user-icon">👤</div>
                                        <div className="user-name">{user.name}</div>
                                        <div className="user-role-badge admin-badge">Admin</div>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ marginTop: 'var(--spacing-2xl)' }}>Installer Login</h3>
                            <div className="user-grid">
                                {installerUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className={`user-card ${selectedUser === user.username ? 'user-card-selected' : ''}`}
                                        onClick={() => setSelectedUser(user.username)}
                                    >
                                        <div className="user-icon">🔧</div>
                                        <div className="user-name">{user.name}</div>
                                        <div className="user-role-badge installer-badge">Installer</div>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ marginTop: 'var(--spacing-2xl)' }}>Vendor Login</h3>
                            <div className="user-grid">
                                {vendorUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className={`user-card ${selectedUser === user.username ? 'user-card-selected' : ''}`}
                                        onClick={() => setSelectedUser(user.username)}
                                    >
                                        <div className="user-icon">🏢</div>
                                        <div className="user-name">{user.name}</div>
                                        <div className="user-role-badge vendor-badge">Vendor</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <Button type="submit" variant="primary" size="lg" className="login-button">
                            Continue
                        </Button>
                    </form>
                </Card>

                <p className="login-footer text-muted">
                    Demo authentication - No password required
                </p>
            </div>
        </div>
    );
};
