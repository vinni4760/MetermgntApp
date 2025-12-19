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
    {
        id: '5',
        username: 'vendor1',
        name: 'PowerGrid Corp',
        role: UserRole.VENDOR,
        vendorId: '1',
    },
    {
        id: '6',
        username: 'vendor2',
        name: 'EnergyPlus Ltd',
        role: UserRole.VENDOR,
        vendorId: '2',
    },
    {
        id: '7',
        username: 'vendor3',
        name: 'MetroSupply Inc',
        role: UserRole.VENDOR,
        vendorId: '3',
    },
];
