import React from 'react';
import { Link } from 'react-router-dom';
import { useMeterContext } from '../context/MeterContext';
import { Card } from '../components/ui';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { stock, installations, vendors } = useMeterContext();

    const stats = [
        {
            label: 'Total Meters',
            value: stock.totalMeters,
            icon: '📦',
            color: 'var(--accent-info)',
            link: '/balance-count'
        },
        {
            label: 'In Stock',
            value: stock.balanceCount,
            icon: '✅',
            color: 'var(--accent-success)',
            link: '/balance-count'
        },
        {
            label: 'Assigned',
            value: stock.assignedMeters,
            icon: '📤',
            color: 'var(--accent-warning)',
            link: '/meter-distribution'
        },
        {
            label: 'Installed',
            value: stock.installedMeters,
            icon: '✓',
            color: 'var(--accent-primary)',
            link: '/daily-installation'
        },
        {
            label: 'In Transit',
            value: stock.inTransitMeters,
            icon: '🚚',
            color: 'var(--accent-secondary)',
            link: '/meter-tracking'
        },
    ];

    const recentInstallations = installations.slice(-5).reverse();

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <div>
                    <h2>Welcome to Meter Management System</h2>
                    <p className="text-muted">Monitor and manage your meter inventory in real-time</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <Link to={stat.link} key={index} style={{ textDecoration: 'none' }}>
                        <Card className="stat-card">
                            <div className="stat-icon" style={{ color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                    <Link to="/meter-distribution" style={{ textDecoration: 'none' }}>
                        <Card className="action-card">
                            <div className="action-icon">📝</div>
                            <h4>Assign Meters</h4>
                            <p className="text-muted">Distribute meters to vendors</p>
                        </Card>
                    </Link>

                    <Link to="/daily-installation" style={{ textDecoration: 'none' }}>
                        <Card className="action-card">
                            <div className="action-icon">⚡</div>
                            <h4>Log Installation</h4>
                            <p className="text-muted">Record new meter installation</p>
                        </Card>
                    </Link>

                    <Link to="/meter-tracking" style={{ textDecoration: 'none' }}>
                        <Card className="action-card">
                            <div className="action-icon">📍</div>
                            <h4>Track Meters</h4>
                            <p className="text-muted">Monitor real-time locations</p>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Recent Installations */}
            <div className="dashboard-section">
                <h3>Recent Installations</h3>
                <Card>
                    {recentInstallations.length > 0 ? (
                        <div className="installations-list">
                            {recentInstallations.map((installation) => (
                                <div key={installation.id} className="installation-item">
                                    <div className="installation-info">
                                        <div className="installation-meter">{installation.meterSerialNumber}</div>
                                        <div className="installation-consumer text-muted">{installation.consumerName}</div>
                                    </div>
                                    <div className="installation-meta text-muted">
                                        {installation.installerName} • {new Date(installation.installationDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center">No recent installations</p>
                    )}
                </Card>
            </div>

            {/* Vendors Summary */}
            <div className="dashboard-section">
                <h3>Active Vendors ({vendors.length})</h3>
                <div className="vendors-grid">
                    {vendors.map((vendor) => (
                        <Card key={vendor.id} className="vendor-card">
                            <div className="vendor-name">{vendor.name}</div>
                            <div className="vendor-stats">
                                <span className="text-muted">Assigned: </span>
                                <span className="vendor-count">{vendor.assignedMetersCount}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
