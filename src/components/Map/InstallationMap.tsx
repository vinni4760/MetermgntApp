import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Installation } from '../../types';
import { InstallationStatus } from '../../types';
import 'leaflet/dist/leaflet.css';
import './InstallationMap.css';

interface InstallationMapProps {
    installations: Installation[];
}

// Fix Leaflet default icon issue with Vite
const createCustomIcon = (status: InstallationStatus) => {
    const color = status === InstallationStatus.INSTALLED ? '#10b981' : '#3b82f6';
    const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" 
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="5" fill="white"/>
    </svg>
  `;
    return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
};

export const InstallationMap: React.FC<InstallationMapProps> = ({ installations }) => {
    // Calculate center based on installations
    const center: [number, number] = installations.length > 0
        ? [
            installations.reduce((sum, i) => sum + i.gpsLocation.latitude, 0) / installations.length,
            installations.reduce((sum, i) => sum + i.gpsLocation.longitude, 0) / installations.length
        ]
        : [20.5937, 78.9629]; // Center of India as default

    return (
        <div className="installation-map-container">
            <MapContainer
                center={center}
                zoom={installations.length > 0 ? 6 : 5}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {installations.map((installation) => (
                    <Marker
                        key={installation.id}
                        position={[installation.gpsLocation.latitude, installation.gpsLocation.longitude]}
                        icon={createCustomIcon(installation.status)}
                    >
                        <Popup maxWidth={300}>
                            <div className="map-popup">
                                <div className="popup-header">
                                    <h4>{installation.meterSerialNumber}</h4>
                                    <span className={`popup-badge ${installation.status === InstallationStatus.INSTALLED ? 'badge-installed' : 'badge-transit'}`}>
                                        {installation.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="popup-content">
                                    <div className="popup-row">
                                        <span className="popup-label">👤 Installer:</span>
                                        <span>{installation.installerName}</span>
                                    </div>

                                    <div className="popup-row">
                                        <span className="popup-label">🏢 Vendor:</span>
                                        <span>{installation.vendorName || 'N/A'}</span>
                                    </div>

                                    <div className="popup-row">
                                        <span className="popup-label">👥 Consumer:</span>
                                        <span>{installation.consumerName}</span>
                                    </div>

                                    <div className="popup-row">
                                        <span className="popup-label">📍 Address:</span>
                                        <span>{installation.consumerAddress}</span>
                                    </div>

                                    <div className="popup-row">
                                        <span className="popup-label">📅 Date:</span>
                                        <span>{new Date(installation.installationDate).toLocaleDateString()}</span>
                                    </div>

                                    <div className="popup-row">
                                        <span className="popup-label">🌍 GPS:</span>
                                        <span className="popup-coords">
                                            {installation.gpsLocation.latitude.toFixed(6)}, {installation.gpsLocation.longitude.toFixed(6)}
                                        </span>
                                    </div>

                                    {installation.newMeterReading && (
                                        <div className="popup-row">
                                            <span className="popup-label">📊 Reading:</span>
                                            <span>{installation.newMeterReading}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="map-legend">
                <div className="legend-item">
                    <div className="legend-marker marker-transit"></div>
                    <span>In Transit ({installations.filter(i => i.status === InstallationStatus.IN_TRANSIT).length})</span>
                </div>
                <div className="legend-item">
                    <div className="legend-marker marker-installed"></div>
                    <span>Installed ({installations.filter(i => i.status === InstallationStatus.INSTALLED).length})</span>
                </div>
            </div>
        </div>
    );
};
