import { useState, useEffect, useCallback } from 'react';
import type { POI } from '../types';

const STORAGE_KEY = 'backtrack_pois';

export const usePOI = () => {
    const [pois, setPois] = useState<POI[]>(() => {
        const savedPOIs = localStorage.getItem(STORAGE_KEY);
        if (savedPOIs) {
            try {
                return JSON.parse(savedPOIs);
            } catch (e) {
                console.error('Failed to parse saved POIs', e);
            }
        }
        return [];
    });

    // Remove the useEffect that loaded from storage, as we now do it in initialization


    // Save to local storage whenever pois changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pois));
    }, [pois]);

    const addPOI = useCallback((poi: POI) => {
        setPois(prev => [...prev, poi]);
    }, []);

    const removePOI = useCallback((id: string) => {
        setPois(prev => prev.filter(p => p.id !== id));
    }, []);

    const updatePOI = useCallback((updatedPOI: POI) => {
        setPois(prev => prev.map(p => p.id === updatedPOI.id ? updatedPOI : p));
    }, []);

    return {
        pois,
        addPOI,
        removePOI,
        updatePOI
    };
};
