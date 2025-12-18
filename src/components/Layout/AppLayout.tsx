import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AppLayout.css';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

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
                            <span className="user-name">Admin</span>
                        </div>
                    </div>
                </header>

                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    );
};
