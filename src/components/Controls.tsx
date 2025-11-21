import React from 'react';
import { Play, Square, RotateCcw, Trash2 } from 'lucide-react';
import type { TrackingState } from '../types';

interface ControlsProps {
    trackingState: TrackingState;
    onStart: () => void;
    onStop: () => void;
    onBacktrack: () => void;
    onClear: () => void;
    hasPath: boolean;
    nightMode: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
    trackingState,
    onStart,
    onStop,
    onBacktrack,
    onClear,
    hasPath,
    nightMode,
}) => {
    const buttonBaseClass = "flex items-center justify-center rounded-full p-6 transition-all active:scale-95 shadow-lg";
    const primaryClass = nightMode
        ? "bg-red-900 text-red-100 hover:bg-red-800 shadow-red-900/30"
        : "bg-white text-black hover:bg-gray-100 shadow-white/10";
    const dangerClass = nightMode
        ? "bg-red-950 text-red-500 border border-red-900 hover:bg-red-900/50"
        : "bg-gray-900 text-red-500 border border-gray-800 hover:bg-gray-800";

    if (trackingState === 'tracking') {
        return (
            <div className="flex gap-4 justify-center items-center w-full pb-8">
                <button
                    onClick={onStop}
                    className={`${buttonBaseClass} ${primaryClass} w-20 h-20`}
                    aria-label="Stop Tracking"
                >
                    <Square size={32} fill="currentColor" />
                </button>
            </div>
        );
    }

    if (trackingState === 'backtracking') {
        return (
            <div className="flex gap-4 justify-center items-center w-full pb-8">
                <button
                    onClick={onStop}
                    className={`${buttonBaseClass} ${primaryClass} w-20 h-20`}
                    aria-label="Stop Backtracking"
                >
                    <Square size={32} fill="currentColor" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-6 justify-center items-center w-full pb-8">
            {hasPath ? (
                <>
                    <button
                        onClick={onClear}
                        className={`${buttonBaseClass} ${dangerClass} w-16 h-16`}
                        aria-label="Clear Path"
                    >
                        <Trash2 size={24} />
                    </button>
                    <button
                        onClick={onBacktrack}
                        className={`${buttonBaseClass} ${primaryClass} w-20 h-20`}
                        aria-label="Start Backtracking"
                    >
                        <RotateCcw size={32} />
                    </button>
                </>
            ) : (
                <button
                    onClick={onStart}
                    className={`${buttonBaseClass} ${primaryClass} w-24 h-24`}
                    aria-label="Start Tracking"
                >
                    <Play size={40} fill="currentColor" className="ml-1" />
                </button>
            )}
        </div>
    );
};
