import React from 'react';
import './Badge.css';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    pulse = false
}) => {
    return (
        <span className={`badge badge-${variant} badge-${size} ${pulse ? 'badge-pulse' : ''}`}>
            {pulse && <span className="badge-pulse-dot"></span>}
            {children}
        </span>
    );
};
