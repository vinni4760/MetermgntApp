import type { User } from '../types';
import { UserRole } from '../types';

export const mockUsers: User[] = [
    {
        id: '1',
        username: 'admin',
        name: 'Admin User',
        role: UserRole.ADMIN,
    },
    {
        id: '2',
        username: 'rajesh',
        name: 'Rajesh Kumar',
        role: UserRole.INSTALLER,
    },
    {
        id: '3',
        username: 'amit',
        name: 'Amit Patel',
        role: UserRole.INSTALLER,
    },
    {
        id: '4',
        username: 'vijay',
        name: 'Vijay Sharma',
        role: UserRole.INSTALLER,
    },
];
