import { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { usePath } from './hooks/usePath';
import { useCompass } from './hooks/useCompass';
import { RadarDisplay } from './components/RadarDisplay';
import { MapDisplay } from './components/MapDisplay';
import { Controls } from './components/Controls';
import { NightModeToggle } from './components/NightModeToggle';
import type { TrackingState } from './types';
import { calculateDistance } from './utils/geometry';
import { Map } from 'lucide-react';

function App() {
  const [trackingState, setTrackingState] = useState<TrackingState>('idle');
  const [nightMode, setNightMode] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const isTracking = trackingState === 'tracking' || trackingState === 'backtracking';

  const { currentPosition, error: geoError, permissionStatus } = useGeolocation(isTracking);
  const { path, clearPath, getBacktrackPath } = usePath(currentPosition, trackingState);
  const { heading, requestPermission } = useCompass();

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

  const displayPath = trackingState === 'backtracking' ? getBacktrackPath() : path;

  // Calculate max distance for scale
  const maxDistance = useMemo(() => {
    if (!currentPosition || displayPath.length === 0) return 100; // Default 100m
    const distances = displayPath.map(p => calculateDistance(currentPosition, p));
    return Math.max(Math.max(...distances), 50); // Min 50m scale
  }, [currentPosition, displayPath]);

  const displayHeading = heading ?? currentPosition?.heading ?? 0;

  return (
    <div className={`relative h-screen w-full overflow-hidden flex flex-col ${nightMode ? 'bg-black text-red-500' : 'bg-white text-gray-900'}`}>

      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col">
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
            {/* {currentPosition && (
              <>
                <span>{toDMS(currentPosition.latitude, true)}</span>
                <span>{toDMS(currentPosition.longitude, false)}</span>
              </>
            )} */}
          </div>
        </div>
        <div className="pointer-events-auto flex flex-col gap-2">
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
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="absolute inset-0 z-0">
        {showMap && (
          <MapDisplay
            currentPosition={currentPosition}
            path={displayPath}
            nightMode={nightMode}
            heading={displayHeading}
          />
        )}
      </div>

      {/* Radar Overlay */}
      {!showMap && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <RadarDisplay
            currentPosition={currentPosition}
            path={displayPath}
            heading={heading}
            nightMode={nightMode}
            maxDistance={maxDistance}
          />
        </div>
      )}

      {/* Permission Warning Overlay */}
      {permissionStatus === 'denied' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-center">
          <div className="bg-gray-900 p-6 rounded-xl border border-red-900 text-red-500">
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
      <div className={`absolute bottom-0 left-0 right-0 z-20 ${nightMode ? 'bg-gradient-to-t from-black via-black/50 to-transparent' : 'bg-gradient-to-t from-white via-white/50 to-transparent'} pt-12 pb-safe`}>
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
    </div>
  );
}

export default App;
