import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface NightModeToggleProps {
    nightMode: boolean;
    onToggle: () => void;
}

export const NightModeToggle: React.FC<NightModeToggleProps> = ({ nightMode, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`p-3 rounded-full transition-colors ${nightMode
                    ? 'bg-red-950 text-red-500 hover:bg-red-900'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
            aria-label="Toggle Night Mode"
        >
            {nightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};
