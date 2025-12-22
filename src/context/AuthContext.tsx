import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAdmin: () => boolean;
    isInstaller: () => boolean;
    isVendor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAdmin = () => user?.role === UserRole.ADMIN;
    const isInstaller = () => user?.role === UserRole.INSTALLER;
    const isVendor = () => user?.role === UserRole.VENDOR;

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAdmin,
            isInstaller,
            isVendor
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
