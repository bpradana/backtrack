import { useState, useEffect } from 'react';

export const useCompass = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOrientation = (event: DeviceOrientationEvent) => {
        // iOS requires webkitCompassHeading
        // @ts-ignore
        if (event.webkitCompassHeading) {
            // @ts-ignore
            setHeading(event.webkitCompassHeading);
        } else if (event.alpha !== null) {
            // Android/Standard
            // alpha is 0 when pointing North (in some implementations) or relative to initial position
            // This is a simplification; true north requires absolute orientation
            setHeading(360 - event.alpha);
        }
    };

    const requestPermission = async () => {
        // @ts-ignore
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                // @ts-ignore
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    return true;
                } else {
                    setError('Permission denied');
                    return false;
                }
            } catch (e) {
                setError('Error requesting permission');
                return false;
            }
        } else {
            // Non-iOS or older devices
            window.addEventListener('deviceorientation', handleOrientation);
            return true;
        }
    };

    useEffect(() => {
        // Try to attach automatically for non-iOS devices
        // @ts-ignore
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    return { heading, error, requestPermission };
};
