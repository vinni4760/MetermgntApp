// Type definitions for the Meter Management System

export enum MeterStatus {
  IN_STOCK = 'IN_STOCK',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  INSTALLED = 'INSTALLED',
}

export enum InstallationStatus {
  IN_TRANSIT = 'IN_TRANSIT',
  INSTALLED = 'INSTALLED',
}

export interface Vendor {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  assignedMetersCount: number;
  createdAt: Date;
}

export interface Meter {
  id: string;
  serialNumber: string;
  vendorId?: string;
  vendorName?: string;
  status: MeterStatus;
  assignedDate?: Date;
  createdAt: Date;
}

export interface Installation {
  id: string;
  meterSerialNumber: string;
  installerName: string;
  vendorName: string;
  consumerName: string;
  consumerAddress: string;
  gpsLocation: {
    latitude: number;
    longitude: number;
  };
  installationDate: Date;
  oldMeterReading?: string;
  newMeterReading: string;
  photosBefore: string[];
  photosAfter: string[];
  status: InstallationStatus;
  createdAt: Date;
}

export interface Stock {
  totalMeters: number;
  assignedMeters: number;
  installedMeters: number;
  inTransitMeters: number;
  balanceCount: number;
}

export interface InstallerLocation {
  installerId: string;
  installerName: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: Date;
  assignedMeters: string[];
}
