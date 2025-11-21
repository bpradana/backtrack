import { useState, useEffect, useRef } from 'react';
import type { Coordinate } from '../types';

interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

interface UseGeolocationResult {
    currentPosition: Coordinate | null;
    error: GeolocationPositionError | null;
    permissionStatus: PermissionState | 'unknown';
}

export const useGeolocation = (
    isTracking: boolean,
    options: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    }
): UseGeolocationResult => {
    const [currentPosition, setCurrentPosition] = useState<Coordinate | null>(null);
    const [error, setError] = useState<GeolocationPositionError | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        // Check permission status
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setPermissionStatus(result.state);
                result.onchange = () => {
                    setPermissionStatus(result.state);
                };
            });
        }
    }, []);

    useEffect(() => {
        if (!isTracking) {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        if (!navigator.geolocation) {
            setError({
                code: 0,
                message: 'Geolocation is not supported by this browser.',
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
            } as GeolocationPositionError);
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            const { latitude, longitude, accuracy, heading, speed } = position.coords;
            setCurrentPosition({
                latitude,
                longitude,
                timestamp: position.timestamp,
                accuracy,
                heading,
                speed,
            });
            setError(null);
        };

        const handleError = (err: GeolocationPositionError) => {
            setError(err);
        };

        watchId.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            options
        );

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
        };
    }, [isTracking, options.enableHighAccuracy, options.timeout, options.maximumAge]);

    return { currentPosition, error, permissionStatus };
};
