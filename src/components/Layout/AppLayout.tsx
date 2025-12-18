import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        {
            label: 'Meter Stock Management',
            icon: '📦',
            submenu: [
                { path: '/meter-distribution', label: 'Meter Distribution' },
                { path: '/daily-installation', label: 'Daily Installation' },
                { path: '/balance-count', label: 'Balance Count' },
            ]
        },
        { path: '/meter-tracking', label: 'Meter Tracking', icon: '📍' },
        { path: '/manage-installers', label: 'Manage Installers', icon: '👥' },
    ];

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">⚡</span>
                        {sidebarOpen && <span className="logo-text">Meter System</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <div key={index}>
                            {item.path ? (
                                <Link
                                    to={item.path}
                                    className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                                </Link>
                            ) : (
                                <>
                                    <div className="nav-group-title">
                                        <span className="nav-icon">{item.icon}</span>
                                        {sidebarOpen && <span>{item.label}</span>}
                                    </div>
                                    {sidebarOpen && item.submenu && (
                                        <div className="nav-submenu">
                                            {item.submenu.map((subitem, subindex) => (
                                                <Link
                                                    key={subindex}
                                                    to={subitem.path}
                                                    className={`nav-subitem ${isActive(subitem.path) ? 'nav-subitem-active' : ''}`}
                                                >
                                                    {subitem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </nav>

                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? '←' : '→'}
                </button>
            </aside>

            {/* Main Content */}
            <div className="main-wrapper">
                <header className="app-header">
                    <h1 className="page-title">Meter Management System</h1>
                    <div className="header-actions">
                        <div className="user-info">
                            <span className="user-avatar">👤</span>
                            <div className="user-details">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-role-text">{user?.role}</span>
                            </div>
                        </div>
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    );
};
