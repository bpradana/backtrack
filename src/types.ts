export interface Coordinate {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
    heading?: number | null;
    speed?: number | null;
}

export interface PathPoint extends Coordinate {
    id: string;
}

export type TrackingState = 'idle' | 'tracking' | 'backtracking';

export interface POI extends Coordinate {
    id: string;
    name: string;
    emoji: string;
    createdAt: number;
}
