import { useState, useEffect, useCallback } from 'react';
import type { Coordinate, PathPoint, TrackingState } from '../types';
import { calculateDistance } from '../utils/geometry';

const MIN_DISTANCE_CHANGE = 5; // meters
const STORAGE_KEY = 'backtrack_path';

export const usePath = (currentPosition: Coordinate | null, trackingState: TrackingState) => {
    const [path, setPath] = useState<PathPoint[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const savedPath = localStorage.getItem(STORAGE_KEY);
        if (savedPath) {
            try {
                setPath(JSON.parse(savedPath));
            } catch (e) {
                console.error('Failed to parse saved path', e);
            }
        }
    }, []);

    // Save to local storage whenever path changes
    useEffect(() => {
        if (path.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(path));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [path]);

    // Add point to path when tracking
    useEffect(() => {
        if (trackingState !== 'tracking' || !currentPosition) return;

        setPath(prevPath => {
            const lastPoint = prevPath[prevPath.length - 1];

            // If it's the first point, add it
            if (!lastPoint) {
                return [...prevPath, { ...currentPosition, id: crypto.randomUUID() }];
            }

            // Calculate distance from last point
            const distance = calculateDistance(lastPoint, currentPosition);

            // Only add if moved significantly (filter jitter)
            if (distance >= MIN_DISTANCE_CHANGE) {
                return [...prevPath, { ...currentPosition, id: crypto.randomUUID() }];
            }

            return prevPath;
        });
    }, [currentPosition, trackingState]);

    const clearPath = useCallback(() => {
        setPath([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const getBacktrackPath = useCallback(() => {
        return [...path].reverse();
    }, [path]);

    return {
        path,
        clearPath,
        getBacktrackPath
    };
};
