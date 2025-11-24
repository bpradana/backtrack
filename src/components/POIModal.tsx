import React, { useState, useEffect } from 'react';
import type { POI, Coordinate } from '../types';
import { X } from 'lucide-react';

interface POIModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (poi: POI) => void;
    onDelete?: (id: string) => void;
    initialPOI?: POI | null;
    currentPosition: Coordinate | null;
    nightMode: boolean;
}

const PRESET_EMOJIS = ['📍', '⛺', '🚗', '🏠', '🚩', '📷', '💧', '🍔', '⚠️', '🌲'];

export const POIModal: React.FC<POIModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialPOI,
    currentPosition,
    nightMode,
}) => {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('📍');

    useEffect(() => {
        if (isOpen) {
            if (initialPOI) {
                setName(initialPOI.name);
                setEmoji(initialPOI.emoji);
            } else {
                setName('');
                setEmoji('📍');
            }
        }
    }, [isOpen, initialPOI]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPosition && !initialPOI) return;

        const timestamp = Date.now();
        const poiToSave: POI = initialPOI
            ? { ...initialPOI, name, emoji }
            : {
                id: crypto.randomUUID(),
                latitude: currentPosition!.latitude,
                longitude: currentPosition!.longitude,
                timestamp,
                name,
                emoji,
                createdAt: timestamp,
            };

        onSave(poiToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-2xl p-6 shadow-xl ${nightMode ? 'bg-gray-900 text-white border border-gray-800' : 'bg-white text-gray-900'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{initialPOI ? 'Edit POI' : 'Add POI'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gray-500/10 text-6xl border-2 border-dashed border-gray-500/30">
                            {emoji}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_EMOJIS.map(e => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-colors ${emoji === e
                                        ? (nightMode ? 'bg-red-900/50 text-red-500 ring-2 ring-red-500' : 'bg-blue-100 text-blue-600 ring-2 ring-blue-500')
                                        : 'hover:bg-gray-500/10'
                                        }`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-70">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Point Name"
                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${nightMode
                                ? 'bg-black border border-gray-800 focus:border-red-500'
                                : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                                }`}
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        {initialPOI && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    onDelete(initialPOI.id);
                                    onClose();
                                }}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white shadow-lg ${nightMode
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-900/30'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                }`}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
