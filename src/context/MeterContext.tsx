import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Meter, Vendor, Installation, Stock } from '../types';
import { MeterStatus, InstallationStatus } from '../types';
import { metersAPI, vendorsAPI, installationsAPI } from '../services/api';

interface MeterContextType {
    meters: Meter[];
    vendors: Vendor[];
    installations: Installation[];
    stock: Stock;
    addMeter: (meter: Omit<Meter, 'id' | 'createdAt'>) => void;
    assignMeterToVendor: (meterId: string, vendorId: string) => void;
    addInstallation: (installation: Omit<Installation, 'id' | 'createdAt'>) => void;
    updateMeterStatus: (meterId: string, status: MeterStatus) => void;
    refreshData: () => Promise<void>;
}

const MeterContext = createContext<MeterContextType | undefined>(undefined);

export const useMeterContext = () => {
    const context = useContext(MeterContext);
    if (!context) {
        throw new Error('useMeterContext must be used within MeterProvider');
    }
    return context;
};

export const MeterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [meters, setMeters] = useState<Meter[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch real data from API
    const fetchData = async () => {
        // Check if user is authenticated before fetching
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('MeterContext: No auth token, skipping data fetch');
            setLoading(false);
            return;
        }

        try {
            console.log('MeterContext: Starting data fetch...');
            setLoading(true);
            const [metersResponse, vendorsResponse, installationsResponse] = await Promise.all([
                metersAPI.getAll(),
                vendorsAPI.getAll(),
                installationsAPI.getAll(),
            ]);

            console.log('MeterContext - Meters API Response:', metersResponse);
            console.log('MeterContext - Vendors API Response:', vendorsResponse);
            console.log('MeterContext - Installations API Response:', installationsResponse);

            // API returns {success, count, data}, so extract the data array
            setMeters(metersResponse.data || []);
            setVendors(vendorsResponse.data || []);
            setInstallations(installationsResponse.data || []);

            console.log('MeterContext - Meters set:', metersResponse.data?.length || 0);
            console.log('MeterContext - Vendors set:', vendorsResponse.data?.length || 0);
        } catch (error: any) {
            console.error('MeterContext - Failed to fetch data:', error);
            console.error('MeterContext - Error details:', error.response?.data || error.message);
            // Set empty arrays on error
            setMeters([]);
            setVendors([]);
            setInstallations([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch when component mounts
    useEffect(() => {
        fetchData();
    }, []);

    // Calculate stock automatically
    const stock: Stock = {
        totalMeters: meters.length,
        assignedMeters: meters.filter(m => m.status === 'ASSIGNED_TO_INSTALLER' || m.status === 'INSTALLED').length,
        installedMeters: meters.filter(m => m.status === 'INSTALLED').length,
        inTransitMeters: 0, // Backend doesn't have separate in-transit status
        balanceCount: meters.filter(m => m.status === 'AVAILABLE').length,
    };

    const addMeter = (meterData: Omit<Meter, 'id' | 'createdAt'>) => {
        const newMeter: Meter = {
            ...meterData,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        setMeters([...meters, newMeter]);
    };

    const assignMeterToVendor = (meterId: string, vendorId: string) => {
        setMeters(meters.map(meter => {
            if (meter.id === meterId) {
                const vendor = vendors.find(v => v.id === vendorId);
                return {
                    ...meter,
                    vendorId,
                    vendorName: vendor?.name,
                    status: MeterStatus.ASSIGNED,
                    assignedDate: new Date(),
                };
            }
            return meter;
        }));
    };

    const addInstallation = (installationData: Omit<Installation, 'id' | 'createdAt'>) => {
        const newInstallation: Installation = {
            ...installationData,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        setInstallations([...installations, newInstallation]);

        // Update meter status
        const meter = meters.find(m => m.serialNumber === installationData.meterSerialNumber);
        if (meter) {
            updateMeterStatus(meter.id,
                installationData.status === InstallationStatus.INSTALLED
                    ? MeterStatus.INSTALLED
                    : MeterStatus.IN_TRANSIT
            );
        }
    };

    const updateMeterStatus = (meterId: string, status: MeterStatus) => {
        setMeters(meters.map(meter =>
            meter.id === meterId ? { ...meter, status } : meter
        ));
    };

    return (
        <MeterContext.Provider value={{
            meters,
            vendors,
            installations,
            stock,
            addMeter,
            assignMeterToVendor,
            addInstallation,
            updateMeterStatus,
            refreshData: fetchData,
        }}>
            {children}
        </MeterContext.Provider>
    );
};
