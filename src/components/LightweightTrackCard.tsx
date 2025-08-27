import React, { useState, useEffect } from 'react';
import { StreamingTrack } from '../types/track';
import unifiedAudioController from '../services/unifiedAudioController';

interface LightweightTrackCardProps {
  track: StreamingTrack;
  onPlay?: (track: StreamingTrack) => void;
  onPause?: (track: StreamingTrack) => void;
  isPlaying?: boolean;
  compact?: boolean;
}

const LightweightTrackCard: React.FC<LightweightTrackCardProps> = ({
  track,
  onPlay,
  onPause,
  isPlaying = false,
  compact = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Register with unified audio controller
  useEffect(() => {
    const stopCallback = () => onPause?.(track);
    unifiedAudioController.registerStopListener(track.id, stopCallback);
    
    return () => {
      unifiedAudioController.unregisterStopListener(track.id);
    };
  }, [track.id, onPause, track]);

  const handlePlay = () => {
    unifiedAudioController.playTrack(track).catch(console.error);
    onPlay?.(track);
  };

  const handlePause = () => {
    unifiedAudioController.pause();
    onPause?.(track);
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all duration-200 ${
        compact ? 'p-3' : 'p-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track Info */}
      <div className="mb-3">
        <h3 className={`font-semibold text-white mb-1 ${compact ? 'text-sm' : 'text-base'}`}>
          {track.title}
        </h3>
        <p className="text-gray-400 text-sm">{track.artist}</p>
        
        {/* Category Badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30">
            {track.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          {track.mood && (
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-600/30">
              {track.mood}
            </span>
          )}
        </div>
      </div>

      {/* Track Details */}
      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <p>Duration: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
        <p>Energy: {track.energy}/5</p>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center justify-center">
        {isPlaying ? (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            ⏸️ Pause
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            ▶️ Play
          </button>
        )}
      </div>

      {/* Demo Mode Notice */}
      <div className="mt-3 p-2 bg-blue-600/10 border border-blue-600/20 rounded-lg">
        <p className="text-xs text-blue-400 text-center">
          🎵 Demo Mode: Manual uploads supported
        </p>
      </div>
    </div>
  );
};

export default LightweightTrackCard;
