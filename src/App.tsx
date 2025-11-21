import { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { usePath } from './hooks/usePath';
import { useCompass } from './hooks/useCompass';
import { RadarDisplay } from './components/RadarDisplay';
import { Controls } from './components/Controls';
import { NightModeToggle } from './components/NightModeToggle';
import type { TrackingState } from './types';
import { calculateDistance } from './utils/geometry';

function App() {
  const [trackingState, setTrackingState] = useState<TrackingState>('idle');
  const [nightMode, setNightMode] = useState(false);

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

  return (
    <div className={`relative h-screen w-full overflow-hidden flex flex-col ${nightMode ? 'bg-black text-red-500' : 'bg-white text-gray-900'}`}>

      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col">
          <h1 className={`text-2xl font-bold tracking-tighter ${nightMode ? 'text-red-500' : 'text-black'}`}>
            BACKTRACK
          </h1>
          <div className="text-xs font-mono opacity-70 mt-1 flex flex-col gap-1">
            <span className={geoError ? 'text-red-500 font-bold' : ''}>
              GPS: {geoError ? 'ERROR' : (currentPosition ? 'ACTIVE' : 'WAITING')}
            </span>
            <span>ACC: {currentPosition?.accuracy ? `±${Math.round(currentPosition.accuracy)}m` : '--'}</span>
            <span>SCL: {Math.round(maxDistance)}m</span>
          </div>
        </div>
        <div className="pointer-events-auto">
          <NightModeToggle nightMode={nightMode} onToggle={() => setNightMode(!nightMode)} />
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 relative">
        <RadarDisplay
          currentPosition={currentPosition}
          path={displayPath}
          heading={heading}
          nightMode={nightMode}
          maxDistance={maxDistance}
        />

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
      </div>

      {/* Controls Area */}
      <div className={`z-20 ${nightMode ? 'bg-gradient-to-t from-black via-black/90 to-transparent' : 'bg-gradient-to-t from-white via-white/90 to-transparent'} pt-12`}>
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
