import { type Meter, type Vendor, type Installation, MeterStatus, InstallationStatus } from '../types';

export const mockVendors: Vendor[] = [
    {
        id: '1',
        name: 'ABC Electric Supplies',
        contactNumber: '+91 9876543210',
        email: 'contact@abcelectric.com',
        assignedMetersCount: 150,
        createdAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        name: 'XYZ Power Solutions',
        contactNumber: '+91 9876543211',
        email: 'info@xyzpower.com',
        assignedMetersCount: 200,
        createdAt: new Date('2024-01-20'),
    },
    {
        id: '3',
        name: 'Metro Electricals',
        contactNumber: '+91 9876543212',
        email: 'sales@metroelec.com',
        assignedMetersCount: 100,
        createdAt: new Date('2024-02-01'),
    },
];

export const mockMeters: Meter[] = [
    {
        id: '1',
        serialNumber: 'MTR-2024-001',
        vendorId: '1',
        vendorName: 'ABC Electric Supplies',
        status: MeterStatus.INSTALLED,
        assignedDate: new Date('2024-12-01'),
        createdAt: new Date('2024-11-15'),
    },
    {
        id: '2',
        serialNumber: 'MTR-2024-002',
        vendorId: '1',
        vendorName: 'ABC Electric Supplies',
        status: MeterStatus.IN_TRANSIT,
        assignedDate: new Date('2024-12-10'),
        createdAt: new Date('2024-11-16'),
    },
    {
        id: '3',
        serialNumber: 'MTR-2024-003',
        vendorId: '2',
        vendorName: 'XYZ Power Solutions',
        status: MeterStatus.ASSIGNED,
        assignedDate: new Date('2024-12-12'),
        createdAt: new Date('2024-11-17'),
    },
    {
        id: '4',
        serialNumber: 'MTR-2024-004',
        status: MeterStatus.IN_STOCK,
        createdAt: new Date('2024-11-18'),
    },
    {
        id: '5',
        serialNumber: 'MTR-2024-005',
        status: MeterStatus.IN_STOCK,
        createdAt: new Date('2024-11-19'),
    },
];

export const mockInstallations: Installation[] = [
    {
        id: '1',
        meterSerialNumber: 'MTR-2024-001',
        installerName: 'Rajesh Kumar',
        vendorName: 'ABC Electric Supplies',
        consumerName: 'John Smith',
        consumerAddress: '123 Main Street, Mumbai, Maharashtra',
        gpsLocation: {
            latitude: 19.0760,
            longitude: 72.8777,
        },
        installationDate: new Date('2024-12-15'),
        oldMeterReading: '12543',
        newMeterReading: '0',
        photosBefore: [],
        photosAfter: [],
        status: InstallationStatus.INSTALLED,
        createdAt: new Date('2024-12-15'),
    },
    {
        id: '2',
        meterSerialNumber: 'MTR-2024-002',
        installerName: 'Amit Patel',
        vendorName: 'ABC Electric Supplies',
        consumerName: 'Sarah Johnson',
        consumerAddress: '456 Park Avenue, Delhi',
        gpsLocation: {
            latitude: 28.7041,
            longitude: 77.1025,
        },
        installationDate: new Date('2024-12-16'),
        newMeterReading: '0',
        photosBefore: [],
        photosAfter: [],
        status: InstallationStatus.IN_TRANSIT,
        createdAt: new Date('2024-12-16'),
    },
];

export const mockInstallers = [
    { id: '1', name: 'Rajesh Kumar' },
    { id: '2', name: 'Amit Patel' },
    { id: '3', name: 'Vijay Sharma' },
    { id: '4', name: 'Pradeep Singh' },
];
