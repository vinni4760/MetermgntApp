import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Card } from '../components/ui';
import './Login.css';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login: setAuthUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(username, password);

            if (response.success) {
                // Set user in AuthContext (also saves to localStorage)
                setAuthUser(response.token, response.user);

                // Redirect based on role
                const role = response.user.role;
                if (role === 'ADMIN') {
                    navigate('/');
                } else if (role === 'INSTALLER') {
                    navigate('/installer');
                } else if (role === 'VENDOR') {
                    navigate('/vendor');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-header">
                    <div className="login-logo">⚡</div>
                    <h1>Meter Management System</h1>
                    <p className="text-muted">Sign in to continue</p>
                </div>

                <Card className="login-card">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                disabled={loading}
                                className="form-input"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                                className="form-input"
                            />
                        </div>

                        {error && (
                            <div className="login-error">{error}</div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </Card>

                <p className="login-footer text-muted">
                    Demo: admin / admin123
                </p>
            </div>
        </div>
    );
};
