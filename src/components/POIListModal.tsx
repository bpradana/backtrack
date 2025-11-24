import React from 'react';
import type { POI, Coordinate } from '../types';
import { X, Plus, Edit2 } from 'lucide-react';
import { calculateDistance } from '../utils/geometry';

interface POIListModalProps {
    isOpen: boolean;
    onClose: () => void;
    pois: POI[];
    onEdit: (poi: POI) => void;
    onAdd: () => void;
    currentPosition: Coordinate | null;
    nightMode: boolean;
}

export const POIListModal: React.FC<POIListModalProps> = ({
    isOpen,
    onClose,
    pois,
    onEdit,
    onAdd,
    currentPosition,
    nightMode,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-sm rounded-2xl p-6 shadow-xl animate-slide-up ${nightMode ? 'bg-gray-900 text-white border border-gray-800' : 'bg-white text-gray-900'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Points of Interest</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 mb-6">
                    {pois.length === 0 ? (
                        <div className="text-center py-8 opacity-50">
                            <p>No points saved yet.</p>
                        </div>
                    ) : (
                        pois.map(poi => {
                            const distance = currentPosition ? calculateDistance(currentPosition, poi) : null;
                            return (
                                <div
                                    key={poi.id}
                                    onClick={() => onEdit(poi)}
                                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all active:scale-98 ${nightMode
                                        ? 'bg-gray-800 hover:bg-gray-700'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="text-2xl">{poi.emoji}</div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{poi.name}</h3>
                                        {distance !== null && (
                                            <p className="text-xs opacity-60">{Math.round(distance)}m away</p>
                                        )}
                                    </div>
                                    <Edit2 size={16} className="opacity-40" />
                                </div>
                            );
                        })
                    )}
                </div>

                <button
                    onClick={onAdd}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${nightMode
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-900/30'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                        }`}
                >
                    <Plus size={20} />
                    <span>Add New Point</span>
                </button>
            </div>
        </div>
    );
};
