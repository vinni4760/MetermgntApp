import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { user } = useAuth();

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles required, check if user has permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect installers trying to access admin routes
        if (user.role === UserRole.INSTALLER) {
            return <Navigate to="/installer" replace />;
        }
        // Redirect admins trying to access installer-only routes (shouldn't happen)
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
