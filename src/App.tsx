import { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { usePath } from './hooks/usePath';
import { useCompass } from './hooks/useCompass';
import { usePOI } from './hooks/usePOI';
import { RadarDisplay } from './components/RadarDisplay';
import { MapDisplay } from './components/MapDisplay';
import { Controls } from './components/Controls';
import { NightModeToggle } from './components/NightModeToggle';
import { POIModal } from './components/POIModal';
import { POIListModal } from './components/POIListModal';
import type { TrackingState, POI } from './types';
import { calculateDistance } from './utils/geometry';
import { Map, List } from 'lucide-react';

function App() {
  const [trackingState, setTrackingState] = useState<TrackingState>('idle');
  const [nightMode, setNightMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isPOIModalOpen, setIsPOIModalOpen] = useState(false);
  const [isPOIListOpen, setIsPOIListOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<POI | null>(null);

  // Always track location for POI features
  const { currentPosition, error: geoError, permissionStatus } = useGeolocation(true);
  const { path, clearPath, getBacktrackPath } = usePath(currentPosition, trackingState);
  const { heading, requestPermission } = useCompass();
  const { pois, addPOI, removePOI, updatePOI } = usePOI();

  // Effect to handle permission errors or denials
  useEffect(() => {
    if (geoError) {
      console.error('Geolocation error:', geoError);
    }
  }, [geoError]);

  // Effect to update theme-color for iOS status bar
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', nightMode ? '#000000' : '#ffffff');
    }
  }, [nightMode]);

  const handleStart = async () => {
    await requestPermission();
    setTrackingState('tracking');
  };

  const handleStop = () => {
    setTrackingState('idle');
  };

  const handleBacktrack = () => {
    setTrackingState('backtracking');
  };

  const handleClear = () => {
    clearPath();
    setTrackingState('idle');
  };

  const handleAddPOI = () => {
    setEditingPOI(null);
    setIsPOIListOpen(false);
    setIsPOIModalOpen(true);
  };

  const handleEditPOI = (poi: POI) => {
    setEditingPOI(poi);
    setIsPOIListOpen(false);
    setIsPOIModalOpen(true);
  };

  const handleSavePOI = (poi: POI) => {
    if (editingPOI) {
      updatePOI(poi);
    } else {
      addPOI(poi);
    }
  };

  const displayPath = trackingState === 'backtracking' ? getBacktrackPath() : path;

  // Calculate max distance for scale
  const maxDistance = useMemo(() => {
    if (!currentPosition) return 100; // Default 100m

    // Only include path points for scale, NOT POIs
    const pathDistances = displayPath.map(p => calculateDistance(currentPosition, p));

    if (pathDistances.length === 0) return 100;

    return Math.max(Math.max(...pathDistances), 50); // Min 50m scale
  }, [currentPosition, displayPath]);

  const displayHeading = heading ?? currentPosition?.heading ?? 0;

  return (
    <div className={`relative h-screen w-full overflow-hidden flex flex-col ${nightMode ? 'bg-black text-red-500' : 'bg-white text-gray-900'}`}>

      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className={`text-2xl font-bold tracking-tighter ${nightMode ? 'text-red-500' : 'text-black'}`}>
            BACKTRACK
          </h1>
          <div className="text-xs font-mono opacity-70 mt-1 flex flex-col gap-1">
            <span className={geoError ? 'text-red-500 font-bold' : ''}>
              GPS: {geoError ? 'ERROR' : (currentPosition ? 'ACTIVE' : 'WAITING')}
            </span>
            <span>HDG: {Math.round(displayHeading)}°</span>
            <span>ACC: {currentPosition?.accuracy ? `±${Math.round(currentPosition.accuracy)}m` : '--'}</span>
            {!showMap && <span>SCL: {Math.round(maxDistance)}m</span>}
          </div>
        </div>
        <div className="pointer-events-auto flex flex-col gap-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <NightModeToggle nightMode={nightMode} onToggle={() => setNightMode(!nightMode)} />
          <button
            onClick={() => setShowMap(!showMap)}
            className={`p-3 rounded-full transition-colors ${nightMode
              ? 'bg-red-950 text-red-500 hover:bg-red-900'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              } ${showMap ? 'ring-2 ring-current' : ''}`}
            aria-label="Toggle Map"
          >
            <Map size={24} />
          </button>
          <button
            onClick={() => setIsPOIListOpen(true)}
            className={`p-3 rounded-full transition-colors ${nightMode
              ? 'bg-red-950 text-red-500 hover:bg-red-900'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            aria-label="List POIs"
          >
            <List size={24} />
          </button>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="absolute inset-0 z-0 animate-fade-in">
        {showMap && (
          <MapDisplay
            currentPosition={currentPosition}
            path={displayPath}
            pois={pois}
            nightMode={nightMode}
            heading={displayHeading}
            onPOIClick={handleEditPOI}
          />
        )}
      </div>

      {/* Radar Overlay */}
      {!showMap && (
        <div className="absolute inset-0 z-10 pointer-events-none animate-fade-in">
          <RadarDisplay
            currentPosition={currentPosition}
            path={displayPath}
            pois={pois}
            heading={heading}
            nightMode={nightMode}
            maxDistance={maxDistance}
          />
        </div>
      )}

      {/* Permission Warning Overlay */}
      {permissionStatus === 'denied' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-center animate-fade-in">
          <div className="bg-gray-900 p-6 rounded-xl border border-red-900 text-red-500 animate-scale-in">
            <h3 className="text-xl font-bold mb-2">Location Access Denied</h3>
            <p className="mb-4">Please enable location services to use Backtrack.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-900 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Controls Area */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 ${nightMode ? 'bg-gradient-to-t from-black via-black/50 to-transparent' : 'bg-gradient-to-t from-white via-white/50 to-transparent'} pt-12 pb-safe animate-slide-up`} style={{ animationDelay: '0.3s' }}>
        <Controls
          trackingState={trackingState}
          onStart={handleStart}
          onStop={handleStop}
          onBacktrack={handleBacktrack}
          onClear={handleClear}
          hasPath={path.length > 0}
          nightMode={nightMode}
        />
      </div>

      <POIModal
        isOpen={isPOIModalOpen}
        onClose={() => setIsPOIModalOpen(false)}
        onSave={handleSavePOI}
        onDelete={removePOI}
        initialPOI={editingPOI}
        currentPosition={currentPosition}
        nightMode={nightMode}
      />

      <POIListModal
        isOpen={isPOIListOpen}
        onClose={() => setIsPOIListOpen(false)}
        pois={pois}
        onEdit={handleEditPOI}
        onAdd={handleAddPOI}
        currentPosition={currentPosition}
        nightMode={nightMode}
      />
    </div>
  );
}

export default App;
