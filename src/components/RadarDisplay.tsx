import React, { useMemo } from 'react';
import type { Coordinate, PathPoint } from '../types';
import { calculateDistance, calculateBearing } from '../utils/geometry';

interface RadarDisplayProps {
    currentPosition: Coordinate | null;
    path: PathPoint[];
    heading: number | null;
    isBacktracking: boolean;
    nightMode: boolean;
}

export const RadarDisplay: React.FC<RadarDisplayProps> = ({
    currentPosition,
    path,
    heading,
    // isBacktracking,
    nightMode,
}) => {
    const rotation = heading ?? 0;
    const scale = 2; // meters per pixel (approx)

    // Transform path points to relative coordinates (x, y) from center
    const relativePath = useMemo(() => {
        if (!currentPosition) return [];

        return path.map((point) => {
            const distance = calculateDistance(currentPosition, point);
            const bearing = calculateBearing(currentPosition, point);

            // Convert polar (distance, bearing) to cartesian (x, y)
            // Adjust bearing by rotation (heading) so "up" is device forward
            const relativeBearing = bearing - rotation;
            const rad = (relativeBearing - 90) * (Math.PI / 180); // -90 to make 0deg up

            const x = distance * Math.cos(rad);
            const y = distance * Math.sin(rad);

            return { x, y, id: point.id };
        });
    }, [currentPosition, path, rotation]);

    if (!currentPosition) {
        return (
            <div className="flex items-center justify-center h-full w-full text-gray-500">
                Waiting for GPS...
            </div>
        );
    }

    const strokeColor = nightMode ? '#ff3b30' : '#3b82f6'; // Red or Blue
    // const centerColor = nightMode ? '#ff3b30' : '#ffffff';

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Grid / Radar Circles */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className={`border rounded-full w-32 h-32 ${nightMode ? 'border-red-900' : 'border-gray-700'}`} />
                <div className={`absolute border rounded-full w-64 h-64 ${nightMode ? 'border-red-900' : 'border-gray-700'}`} />
                <div className={`absolute border rounded-full w-96 h-96 ${nightMode ? 'border-red-900' : 'border-gray-700'}`} />
            </div>

            {/* Path Visualization */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="-150 -150 300 300" // Fixed viewbox centered at 0,0
                preserveAspectRatio="xMidYMid slice"
            >
                <g transform={`scale(${1 / scale})`}>
                    {relativePath.length > 1 && (
                        <polyline
                            points={relativePath.map((p) => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={4 * scale}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300 ease-linear"
                        />
                    )}

                    {/* Start Point Marker */}
                    {relativePath.length > 0 && (
                        <circle
                            cx={relativePath[0].x}
                            cy={relativePath[0].y}
                            r={6 * scale}
                            fill={nightMode ? '#991b1b' : '#1e40af'}
                        />
                    )}
                </g>
            </svg>

            {/* Current Position Marker (Always Center) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-4 h-4 rounded-full shadow-lg z-10 ${nightMode ? 'bg-red-500 shadow-red-900/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
                <div className={`absolute w-32 h-32 bg-gradient-to-t from-transparent to-current opacity-10 rounded-t-full transform -translate-y-16 pointer-events-none ${nightMode ? 'text-red-500' : 'text-blue-500'}`} />
            </div>

            {/* Info Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between text-xs font-mono opacity-70">
                <span>{heading ? `${Math.round(heading)}°` : '--°'}</span>
                <span>{path.length} pts</span>
            </div>
        </div>
    );
};
