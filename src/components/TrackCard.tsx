import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../types/track';
import { audioController } from '../services/audioController';

interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
  onPause?: (track: Track) => void;
  isPlaying?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = memo(({
  track,
  onPlay,
  onPause,
  isPlaying = false,
  showActions = true,
  compact = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(false);

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      audioController.stop();
      onPause?.(track);
    } else {
      audioController.playTrack(track).catch(console.error);
      onPlay?.(track);
    }
  };

  // Handle like toggle
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Handle playlist toggle
  const handlePlaylistToggle = () => {
    setIsInPlaylist(!isInPlaylist);
  };

  // Copy attribution text
  const copyAttribution = () => {
    const attribution = `${track.title} by ${track.artist}`;
    navigator.clipboard.writeText(attribution);
  };

  // Download track (placeholder for manual uploads)
  const handleDownload = () => {
    // For manual uploads, we'll implement download functionality
    console.log('Download functionality for manual uploads coming soon');
  };

  return (
    <motion.div
      className={`bg-gray-800 rounded-2xl p-6 border border-gray-600 hover:border-gray-500 transition-all duration-200 ${
        compact ? 'p-4' : 'p-6'
      }`}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Track Info */}
      <div className="mb-4">
        <h3 className={`font-bold text-white mb-2 ${compact ? 'text-lg' : 'text-xl'}`}>
          {track.title}
        </h3>
        <p className="text-gray-400 mb-2">{track.artist}</p>
        
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30">
            {track.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          {track.mood && (
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-600/30">
              {track.mood}
            </span>
          )}
        </div>

        {/* Track Details */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>Duration: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
          <p>Energy: {track.energy}/5</p>
          {track.bpm && <p>BPM: {track.bpm}</p>}
          {track.key && <p>Key: {track.key}</p>}
        </div>
      </div>

      {/* Tags */}
      {track.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {track.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {track.tags.length > 4 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
              +{track.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          {/* Play/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className={`p-3 rounded-xl font-medium transition-all duration-200 ${
              isPlaying
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </motion.button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isLiked
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
            >
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>

            {/* Playlist Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlaylistToggle}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isInPlaylist
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>

            {/* Attribution Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={copyAttribution}
              className="p-2 bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200"
              title="Copy attribution"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </motion.button>

            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="p-2 bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200"
              title="Download track"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.button>
          </div>
        </div>
      )}

      {/* Demo Mode Notice */}
      <div className="mt-4 p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
        <p className="text-xs text-blue-400 text-center">
          🎵 Demo Mode: Manual uploads supported. Audio player coming soon!
        </p>
      </div>
    </motion.div>
  );
});

TrackCard.displayName = 'TrackCard';

export default TrackCard;

