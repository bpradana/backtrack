import { useState, useEffect } from 'react';

export const useCompass = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!window.DeviceOrientationEvent) {
            setError('Device orientation not supported');
            return;
        }

        const handleOrientation = (event: DeviceOrientationEvent) => {
            // iOS requires webkitCompassHeading
            // @ts-ignore
            if (event.webkitCompassHeading) {
                // @ts-ignore
                setHeading(event.webkitCompassHeading);
            } else if (event.alpha) {
                // Android/Standard
                // alpha is 0 when pointing North (in some implementations) or relative to initial position
                // This is a simplification; true north requires absolute orientation
                setHeading(360 - event.alpha);
            }
        };

        // Request permission for iOS 13+
        const requestPermission = async () => {
            // @ts-ignore
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    // @ts-ignore
                    const response = await DeviceOrientationEvent.requestPermission();
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        setError('Permission denied');
                    }
                } catch (e) {
                    setError('Error requesting permission');
                }
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        };

        requestPermission();

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    return { heading, error };
};
