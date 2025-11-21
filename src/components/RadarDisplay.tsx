import React, { useMemo } from 'react';
import type { Coordinate, PathPoint } from '../types';
import { calculateDistance, calculateBearing } from '../utils/geometry';

interface RadarDisplayProps {
    currentPosition: Coordinate | null;
    path: PathPoint[];
    heading: number | null;
    // isBacktracking,
    nightMode: boolean;
    maxDistance: number;
}

export const RadarDisplay: React.FC<RadarDisplayProps> = ({
    currentPosition,
    path,
    heading,
    // isBacktracking,
    nightMode,
    maxDistance,
}) => {
    // Use GPS heading if compass is not available
    const displayHeading = heading ?? currentPosition?.heading ?? 0;

    // Dynamic scale: View radius (approx 150px) / maxDistance
    // We want the max point to be at ~80% of the radius
    const viewRadius = 140; // SVG coordinate space radius
    const scale = (viewRadius * 0.8) / maxDistance;

    // Generate rings (e.g., 4 rings)
    const rings = useMemo(() => {
        const step = maxDistance / 4;
        // Round step to nice numbers (10, 25, 50, 100)
        const magnitude = Math.pow(10, Math.floor(Math.log10(step)));
        const niceStep = Math.ceil(step / magnitude) * magnitude;

        const result = [];
        for (let i = 1; i * niceStep <= maxDistance * 1.2; i++) {
            result.push(i * niceStep);
        }
        return result;
    }, [maxDistance]);

    // Transform path points to relative coordinates (x, y) from center
    const relativePath = useMemo(() => {
        if (!currentPosition) return [];

        return path.map((point) => {
            const distance = calculateDistance(currentPosition, point);
            const bearing = calculateBearing(currentPosition, point);

            // Convert polar (distance, bearing) to cartesian (x, y)
            // Adjust bearing by rotation (heading) so "up" is device forward
            const relativeBearing = bearing - displayHeading;
            const rad = (relativeBearing - 90) * (Math.PI / 180); // -90 to make 0deg up

            const x = distance * scale * Math.cos(rad);
            const y = distance * scale * Math.sin(rad);

            return { x, y, id: point.id };
        });
    }, [currentPosition, path, displayHeading, scale]);

    if (!currentPosition) {
        return (
            <div className="flex items-center justify-center h-full w-full text-gray-500">
                Waiting for GPS...
            </div>
        );
    }

    const strokeColor = nightMode ? '#ff3b30' : '#3b82f6'; // Red or Blue

    // Accuracy Cone Calculation
    // Map accuracy (meters) to angle width. 
    // Heuristic: Larger accuracy = Wider cone. 
    // Let's say 10m accuracy = 30deg, 100m = 90deg.
    const accuracyMeters = currentPosition.accuracy || 0;
    const coneAngle = Math.min(Math.max(accuracyMeters, 15), 120);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="-150 -150 300 300" // Fixed viewbox centered at 0,0
                preserveAspectRatio="xMidYMid slice"
            >
                {/* Rings drawn in SVG for alignment */}
                {rings.map((r) => (
                    <g key={r}>
                        <circle
                            cx="0"
                            cy="0"
                            r={r * scale}
                            fill="none"
                            stroke={nightMode ? '#7f1d1d' : '#e5e7eb'}
                            strokeWidth="1"
                            strokeOpacity="0.5"
                            vectorEffect="non-scaling-stroke"
                        />
                        <text
                            x="0"
                            y={-(r * scale) + 12}
                            textAnchor="middle"
                            fill={nightMode ? '#7f1d1d' : '#9ca3af'}
                            fontSize="7"
                            fontFamily="monospace"
                        >
                            {r}m
                        </text>
                    </g>
                ))}

                {/* Accuracy Cone (Flashlight) */}
                {/* Points Up (0, -r) because map is Track Up */}
                <defs>
                    <radialGradient id="coneGradient" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0%" stopColor={nightMode ? '#ff0000' : '#0088ff'} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={nightMode ? '#ff0000' : '#0088ff'} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <path
                    d={`M 0 0 L ${viewRadius * Math.sin(coneAngle * Math.PI / 360)} ${-viewRadius * Math.cos(coneAngle * Math.PI / 360)} A ${viewRadius} ${viewRadius} 0 0 0 ${-viewRadius * Math.sin(coneAngle * Math.PI / 360)} ${-viewRadius * Math.cos(coneAngle * Math.PI / 360)} Z`}
                    fill="url(#coneGradient)"
                    className="transition-all duration-500"
                />

                <g>
                    {relativePath.length > 1 && (
                        <polyline
                            points={relativePath.map((p) => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300 ease-linear"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {/* Start Point Marker */}
                    {relativePath.length > 0 && (
                        <circle
                            cx={relativePath[0].x}
                            cy={relativePath[0].y}
                            r="4"
                            fill={nightMode ? '#991b1b' : '#1e40af'}
                        />
                    )}
                </g>
            </svg>

            {/* Current Position Marker (Always Center) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-4 h-4 rounded-full shadow-lg z-10 ${nightMode ? 'bg-red-500 shadow-red-900/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
            </div>


        </div>
    );
};