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

export const toDMS = (deg: number, isLat: boolean): string => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    let direction = "";
    if (isLat) {
        direction = deg >= 0 ? "N" : "S";
    } else {
        direction = deg >= 0 ? "E" : "W";
    }

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
};
