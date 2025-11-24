import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinate, PathPoint, POI } from '../types';

interface MapDisplayProps {
    currentPosition: Coordinate | null;
    path: PathPoint[];
    pois: POI[];
    nightMode: boolean;
    heading: number | null;
    onPOIClick: (poi: POI) => void;
}

// Component to center map on position update
const MapRecenter: React.FC<{ position: Coordinate | null }> = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView([position.latitude, position.longitude], map.getZoom());
        }
    }, [position, map]);
    return null;
};

export const MapDisplay: React.FC<MapDisplayProps> = ({
    currentPosition,
    path,
    pois,
    nightMode,
    heading,
    onPOIClick
}) => {
    if (!currentPosition) {
        return (
            <div className="flex items-center justify-center h-full w-full text-gray-500">
                Waiting for GPS...
            </div>
        );
    }

    const pathCoordinates = path.map(p => [p.latitude, p.longitude] as [number, number]);
    const displayHeading = heading ?? currentPosition.heading ?? 0;

    const createPOIIcon = (emoji: string, nightMode: boolean) => {
        return L.divIcon({
            className: 'custom-poi-icon',
            html: `<div style="
                background-color: ${nightMode ? '#000000' : '#ffffff'};
                border: 2px solid ${nightMode ? '#ff3b30' : '#3b82f6'};
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">${emoji}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });
    };

    return (
        <div className={`w-full h-full absolute inset-0 overflow-hidden ${nightMode ? 'invert contrast-75 hue-rotate-180' : ''}`}>
            <div
                className="absolute transition-transform duration-300 ease-linear"
                style={{
                    width: '150vmax',
                    height: '150vmax',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${-displayHeading}deg)`,
                    transformOrigin: 'center center'
                }}
            >
                <MapContainer
                    center={[currentPosition.latitude, currentPosition.longitude]}
                    zoom={18}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false} // Disable dragging to keep centered
                    doubleClickZoom={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {pathCoordinates.length > 0 && (
                        <Polyline positions={pathCoordinates} color="blue" />
                    )}

                    {pois.map(poi => (
                        <Marker
                            key={poi.id}
                            position={[poi.latitude, poi.longitude]}
                            icon={createPOIIcon(poi.emoji, nightMode)}
                            eventHandlers={{
                                click: () => onPOIClick(poi)
                            }}
                        />
                    ))}

                    <MapRecenter position={currentPosition} />
                </MapContainer>
            </div>

            {/* Accuracy Cone Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <svg
                    className="w-full h-full"
                    viewBox="-150 -150 300 300"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <radialGradient id="mapConeGradient" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor={nightMode ? '#ff0000' : '#0088ff'} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={nightMode ? '#ff0000' : '#0088ff'} stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <path
                        d={`M 0 0 L ${140 * Math.sin(Math.min(Math.max(currentPosition.accuracy || 0, 15), 120) * Math.PI / 360)} ${-140 * Math.cos(Math.min(Math.max(currentPosition.accuracy || 0, 15), 120) * Math.PI / 360)} A ${140} ${140} 0 0 0 ${-140 * Math.sin(Math.min(Math.max(currentPosition.accuracy || 0, 15), 120) * Math.PI / 360)} ${-140 * Math.cos(Math.min(Math.max(currentPosition.accuracy || 0, 15), 120) * Math.PI / 360)} Z`}
                        fill="url(#mapConeGradient)"
                        className="transition-all duration-500"
                    />
                </svg>
            </div>

            {/* Static Center Marker (Overlay) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className={`w-4 h-4 rounded-full shadow-lg border-2 border-white ${nightMode ? 'bg-red-500 shadow-red-900/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
            </div>
        </div>
    );
};