import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeterContext } from '../context/MeterContext';
import { Card, Button } from '../components/ui';
import { InstallationStatus } from '../types';
import './InstallerView.css';

export const InstallerView: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { installations } = useMeterContext();

    // Filter installations by current installer
    const myInstallations = installations.filter(
        i => i.installerName === user?.name
    );

    const todayInstallations = myInstallations.filter(i => {
        const today = new Date().toDateString();
        return new Date(i.installationDate).toDateString() === today;
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="installer-view">
            {/* Header */}
            <div className="installer-header">
                <div className="installer-header-content">
                    <div className="installer-logo">⚡</div>
                    <div>
                        <h1>Installer Dashboard</h1>
                        <p className="text-muted">Welcome, {user?.name}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleLogout} size="sm">
                    Logout
                </Button>
            </div>

            {/* Stats */}
            <div className="installer-stats">
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">{todayInstallations.length}</div>
                    <div className="stat-label-installer">Today's Installations</div>
                </Card>
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">
                        {myInstallations.filter(i => i.status === InstallationStatus.IN_TRANSIT).length}
                    </div>
                    <div className="stat-label-installer">In Transit</div>
                </Card>
                <Card className="stat-card-installer">
                    <div className="stat-value-installer">{myInstallations.length}</div>
                    <div className="stat-label-installer">Total Installations</div>
                </Card>
            </div>

            {/* Main Action */}
            <div className="installer-main-action">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/daily-installation')}
                    className="new-installation-button"
                >
                    ⚡ New Installation
                </Button>
                <p className="text-muted">Log a new meter installation</p>
            </div>

            {/* Recent Installations */}
            <Card className="recent-installations-card">
                <h3>My Recent Installations</h3>
                {myInstallations.length > 0 ? (
                    <div className="installations-list-installer">
                        {myInstallations.slice(-10).reverse().map((installation) => (
                            <div key={installation.id} className="installation-item-installer">
                                <div className="installation-header-row">
                                    <div className="meter-serial-installer">{installation.meterSerialNumber}</div>
                                    <span className={`status-dot ${installation.status === InstallationStatus.INSTALLED ? 'status-installed' : 'status-transit'}`}>
                                        {installation.status === InstallationStatus.INSTALLED ? '✓ Installed' : '🚚 In Transit'}
                                    </span>
                                </div>
                                <div className="installation-details-row">
                                    <span className="text-muted">👥 {installation.consumerName}</span>
                                    <span className="text-muted">📅 {new Date(installation.installationDate).toLocaleDateString()}</span>
                                </div>
                                <div className="installation-address text-muted">
                                    📍 {installation.consumerAddress}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-installations">
                        <div className="no-installations-icon">📭</div>
                        <p>No installations yet</p>
                        <p className="text-muted">Click "New Installation" to get started</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
