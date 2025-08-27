import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreamingTrack } from '../types/track';
import unifiedAudioController from '../services/unifiedAudioController';
import trackStorageService from '../services/trackStorageService';
import authService, { FeatureFlags } from '../services/authService';

interface StreamerModeProps {
  isActive: boolean;
  onToggle: () => void;
}

const StreamerMode: React.FC<StreamerModeProps> = ({ isActive, onToggle }) => {
  const [tracks, setTracks] = useState<StreamingTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<StreamingTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);

  const triggerTrack = useCallback(async (track: StreamingTrack): Promise<void> => {
    try {
      setSelectedTrack(track);
      setIsPlaying(true);

      if (isPlaying) {
        unifiedAudioController.stop();
      }

      await unifiedAudioController.playTrack(track);

      const updatedTrack = {
        ...track,
        usageTracking: {
          ...(track.usageTracking || { usageCount: 0 }),
          usageCount: ((track.usageTracking && track.usageTracking.usageCount) ? track.usageTracking.usageCount : 0) + 1,
          lastUsed: new Date()
        }
      };
      trackStorageService.saveTrack(updatedTrack);

    } catch (error) {
      console.error('Error triggering track:', error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const setupKeyboardShortcuts = useCallback(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return;

      const key = e.key;
      const trackIndex = parseInt(key) - 1;

      if (trackIndex >= 0 && trackIndex < tracks.length) {
        e.preventDefault();
        const track = tracks[trackIndex];
        if (track) {
          triggerTrack(track);
        }
      }

      if (key === ' ') {
        e.preventDefault();
        if (isPlaying) {
          pauseTrack();
        } else if (selectedTrack) {
          playTrack(selectedTrack);
        }
      }

      if (key === 'Escape') {
        e.preventDefault();
        stopTrack();
      }

      if (key.toLowerCase() === 'm') {
        e.preventDefault();
        setVolume(volume > 0 ? 0 : 50);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, tracks, isPlaying, selectedTrack, volume, triggerTrack]);

  // Load feature flags
  useEffect(() => {
    const flags = authService.getFeatureFlags();
    setFeatureFlags(flags);
    console.log('🔒 StreamerMode feature flags:', flags);
  }, []);

  useEffect(() => {
    if (isActive) {
      loadTracks();
      // Only setup hotkeys if user has access
      if (featureFlags?.canUseHotkeys) {
        const cleanup = setupKeyboardShortcuts();
        return () => {
          cleanup();
        };
      }
    } else {
      removeKeyboardShortcuts();
    }

    return () => {
      removeKeyboardShortcuts();
    };
  }, [isActive, setupKeyboardShortcuts, featureFlags?.canUseHotkeys]);

  const loadTracks = () => {
    try {
      const allTracks = trackStorageService.getAllTracks();
      // Limit to first 9 tracks for number keys 1-9
      setTracks(allTracks.slice(0, 9));
    } catch (error) {
      console.error('Error loading tracks for streamer mode:', error);
    }
  };

  // duplicate setupKeyboardShortcuts removed; using memoized version above

  const removeKeyboardShortcuts = () => {
    // Cleanup is handled in the return function of setupKeyboardShortcuts
  };

  const playTrack = async (track: StreamingTrack) => {
    try {
      setIsPlaying(true);
      await unifiedAudioController.playTrack(track);
    } catch (error) {
      console.error('Error playing track:', error);
      setIsPlaying(false);
    }
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    unifiedAudioController.pause();
  };

  const stopTrack = () => {
    setIsPlaying(false);
    setSelectedTrack(null);
    unifiedAudioController.stop();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    unifiedAudioController.setVolume(newVolume);
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-gray-900 rounded-2xl p-8 max-w-6xl w-full max-h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🎮 Streamer Mode</h1>
            <p className="text-gray-400 text-lg">
              Large buttons for quick track triggering • Keyboard shortcuts enabled
            </p>
            
            {/* Feature Restriction Notice */}
            {featureFlags && !featureFlags.canUseHotkeys && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mt-3 max-w-md">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 text-lg">🔒</span>
                  <div>
                    <p className="text-yellow-200 font-medium">Hotkeys Disabled</p>
                    <p className="text-yellow-300 text-sm">
                      Upgrade to Pro plan to enable keyboard shortcuts
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHotkeys(!showHotkeys)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {showHotkeys ? 'Hide' : 'Show'} Hotkeys
            </button>
            <button
              onClick={onToggle}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
            >
              Exit Streamer Mode
            </button>
          </div>
        </div>

        {/* Hotkeys Guide */}
        <AnimatePresence>
          {showHotkeys && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800 rounded-lg p-6 mb-8"
            >
              <h3 className="text-xl font-semibold text-white mb-4">⌨️ Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-gray-300">
                  <span className="font-mono bg-gray-700 px-2 py-1 rounded">1-9</span>
                  <span className="ml-2">Trigger track</span>
                </div>
                <div className="text-gray-300">
                  <span className="font-mono bg-gray-700 px-2 py-1 rounded">Space</span>
                  <span className="ml-2">Play/Pause</span>
                </div>
                <div className="text-gray-300">
                  <span className="font-mono bg-gray-700 px-2 py-1 rounded">Esc</span>
                  <span className="ml-2">Stop</span>
                </div>
                <div className="text-gray-300">
                  <span className="font-mono bg-gray-700 px-2 py-1 rounded">M</span>
                  <span className="ml-2">Mute/Unmute</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Track Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {tracks.map((track, index) => (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => triggerTrack(track)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                selectedTrack?.id === track.id
                  ? 'border-blue-500 bg-blue-600/20'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              {/* Hotkey Number */}
              <div className="absolute top-2 right-2 w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              {/* Track Info */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2 truncate">
                  {track.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {track.genre} • {track.mood}
                </p>
                <div className="text-2xl mb-2">
                  {selectedTrack?.id === track.id && isPlaying ? '⏸️' : '▶️'}
                </div>
                <p className="text-gray-500 text-xs">
                  Duration: {track.duration}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Currently Playing */}
        {selectedTrack && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">🎵 Now Playing</h3>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white">{selectedTrack.title}</h4>
                <p className="text-gray-400">
                  {selectedTrack.genre} • {selectedTrack.mood} • {selectedTrack.energyLevel} energy
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => isPlaying ? pauseTrack() : playTrack(selectedTrack)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isPlaying
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                <button
                  onClick={stopTrack}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  ⏹️ Stop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Volume Control */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">🔊 Volume Control</h3>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 w-16">Volume:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1 h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white w-12 text-right">{volume}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StreamerMode