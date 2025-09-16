import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import unifiedAudioController from '../../services/unifiedAudioController';
import { StreamingTrack } from '../../types/track';

interface MiniPlayerProps {
  className?: string;
  showTrackInfo?: boolean;
  showControls?: boolean;
  showVolume?: boolean;
  compact?: boolean;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  className = '',
  showTrackInfo = true,
  showControls = true,
  showVolume = false,
  compact = false
}) => {
  const [currentTrack, setCurrentTrack] = useState<StreamingTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(unifiedAudioController.getVolume());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Set up event listeners
    const handleTrackChange = (track: StreamingTrack | null) => setCurrentTrack(track);
    const handlePlayStateChange = (playing: boolean) => setIsPlaying(playing);
    const handleVolumeChange = (vol: number) => setVolume(vol);
    const handleTimeUpdate = (time: number) => setCurrentTime(time);
    const handleBufferingStart = () => setIsBuffering(true);
    const handleBufferingEnd = () => setIsBuffering(false);

    unifiedAudioController.on('onTrackChange', handleTrackChange);
    unifiedAudioController.on('onPlayStateChange', handlePlayStateChange);
    unifiedAudioController.on('onVolumeChange', handleVolumeChange);
    unifiedAudioController.on('onTimeUpdate', handleTimeUpdate);
    unifiedAudioController.on('onBufferingStart', handleBufferingStart);
    unifiedAudioController.on('onBufferingEnd', handleBufferingEnd);

    // Set initial state
    const state = unifiedAudioController.getCurrentState();
    setCurrentTrack(state.currentTrack);
    setIsPlaying(state.isPlaying);
    setIsBuffering(state.isBuffering);
    setVolume(state.volume);
    setCurrentTime(state.currentTime);
    setDuration(state.duration);

    return () => {
      unifiedAudioController.off('onTrackChange');
      unifiedAudioController.off('onPlayStateChange');
      unifiedAudioController.off('onVolumeChange');
      unifiedAudioController.off('onTimeUpdate');
      unifiedAudioController.off('onBufferingStart');
      unifiedAudioController.off('onBufferingEnd');
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      unifiedAudioController.pause();
    } else {
      unifiedAudioController.resume();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    unifiedAudioController.setVolume(newVolume);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if no track is playing and we're in compact mode
  if (compact && !currentTrack) {
    return null;
  }

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`bg-stream-gray/95 backdrop-blur-sm border border-stream-light/20 rounded-xl p-4 shadow-lg ${className}`}
        >
          <div className={`flex items-center gap-4 ${compact ? 'gap-3' : 'gap-4'}`}>
            {/* Track Info */}
            {showTrackInfo && (
              <div className="flex-1 min-w-0">
                <h4 className={`text-white font-semibold truncate ${compact ? 'text-sm' : 'text-base'}`}>
                  {currentTrack.title}
                </h4>
                <p className={`text-gray-400 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                  {currentTrack.artist}
                </p>
                {!compact && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <span className="px-2 py-1 bg-stream-accent/20 text-stream-accent text-xs rounded-full">
                      {currentTrack.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            {showControls && (
              <div className="flex items-center gap-2">
                {/* Play/Pause Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayPause}
                  disabled={isBuffering}
                  className={`relative flex items-center justify-center rounded-xl font-medium transition-all duration-200 ${
                    compact ? 'w-10 h-10 min-w-10 min-h-10' : 'w-12 h-12 min-w-12 min-h-12'
                  } ${
                    isPlaying
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${isBuffering ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  <AnimatePresence mode="wait">
                    {isBuffering ? (
                      <motion.div
                        key="buffering"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center justify-center"
                      >
                        <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${
                          compact ? 'w-4 h-4' : 'w-5 h-5'
                        }`}></div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="play-pause"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center justify-center"
                      >
                        {isPlaying ? (
                          <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Buffering Indicator */}
                <AnimatePresence>
                  {isBuffering && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2 text-gray-400"
                    >
                      <div className="animate-spin rounded-full border-2 border-gray-400 border-t-transparent w-4 h-4"></div>
                      <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                        Buffering...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Volume Control */}
                {showVolume && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-500 w-8">{Math.round(volume)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar (only in non-compact mode) */}
          {!compact && duration > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-stream-accent h-1 rounded-full transition-all duration-200"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniPlayer;
