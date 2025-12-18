import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import { mockUsers } from '../utils/mockUsers';

interface AuthContextType {
    user: User | null;
    users: User[];
    login: (username: string) => boolean;
    logout: () => void;
    isAdmin: () => boolean;
    isInstaller: () => boolean;
    addInstaller: (installer: Omit<User, 'id' | 'role'>) => void;
    updateInstaller: (id: string, updates: Partial<User>) => void;
    deleteInstaller: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    const [users, setUsers] = useState<User[]>(() => {
        const saved = localStorage.getItem('systemUsers');
        return saved ? JSON.parse(saved) : mockUsers;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('systemUsers', JSON.stringify(users));
    }, [users]);

    const login = (username: string): boolean => {
        const foundUser = users.find(u => u.username === username);
        if (foundUser) {
            setUser(foundUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const isAdmin = () => user?.role === UserRole.ADMIN;
    const isInstaller = () => user?.role === UserRole.INSTALLER;

    const addInstaller = (installer: Omit<User, 'id' | 'role'>) => {
        const newInstaller: User = {
            ...installer,
            id: Date.now().toString(),
            role: UserRole.INSTALLER,
        };
        setUsers(prev => [...prev, newInstaller]);
    };

    const updateInstaller = (id: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const deleteInstaller = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    return (
        <AuthContext.Provider value={{
            user,
            users,
            login,
            logout,
            isAdmin,
            isInstaller,
            addInstaller,
            updateInstaller,
            deleteInstaller
        }}>
            {children}
        </AuthContext.Provider>
    );
};
