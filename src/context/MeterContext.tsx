import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Meter, Vendor, Installation, Stock } from '../types';
import { MeterStatus, InstallationStatus } from '../types';
import { mockMeters, mockVendors, mockInstallations } from '../utils/mockData';

interface MeterContextType {
    meters: Meter[];
    vendors: Vendor[];
    installations: Installation[];
    stock: Stock;
    addMeter: (meter: Omit<Meter, 'id' | 'createdAt'>) => void;
    assignMeterToVendor: (meterId: string, vendorId: string) => void;
    addInstallation: (installation: Omit<Installation, 'id' | 'createdAt'>) => void;
    updateMeterStatus: (meterId: string, status: MeterStatus) => void;
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
    const [meters, setMeters] = useState<Meter[]>(() => {
        const saved = localStorage.getItem('meters');
        return saved ? JSON.parse(saved) : mockMeters;
    });

    const [vendors, setVendors] = useState<Vendor[]>(() => {
        const saved = localStorage.getItem('vendors');
        return saved ? JSON.parse(saved) : mockVendors;
    });

    const [installations, setInstallations] = useState<Installation[]>(() => {
        const saved = localStorage.getItem('installations');
        return saved ? JSON.parse(saved) : mockInstallations;
    });

    // Calculate stock automatically
    const stock: Stock = {
        totalMeters: meters.length,
        assignedMeters: meters.filter(m => m.status === MeterStatus.ASSIGNED || m.status === MeterStatus.IN_TRANSIT || m.status === MeterStatus.INSTALLED).length,
        installedMeters: meters.filter(m => m.status === MeterStatus.INSTALLED).length,
        inTransitMeters: meters.filter(m => m.status === MeterStatus.IN_TRANSIT).length,
        balanceCount: meters.filter(m => m.status === MeterStatus.IN_STOCK).length,
    };

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('meters', JSON.stringify(meters));
    }, [meters]);

    useEffect(() => {
        localStorage.setItem('vendors', JSON.stringify(vendors));
    }, [vendors]);

    useEffect(() => {
        localStorage.setItem('installations', JSON.stringify(installations));
    }, [installations]);

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
        }}>
            {children}
        </MeterContext.Provider>
    );
};
