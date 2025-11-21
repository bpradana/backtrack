import { getDistance, getGreatCircleBearing } from 'geolib';
import type { Coordinate } from '../types';

export const calculateDistance = (from: Coordinate, to: Coordinate): number => {
    return getDistance(
        { latitude: from.latitude, longitude: from.longitude },
        { latitude: to.latitude, longitude: to.longitude }
    );
};

export const calculateBearing = (from: Coordinate, to: Coordinate): number => {
    return getGreatCircleBearing(
        { latitude: from.latitude, longitude: from.longitude },
        { latitude: to.latitude, longitude: to.longitude }
    );
};

export const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
};
