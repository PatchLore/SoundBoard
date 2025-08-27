import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../types/track';
import { getCategoryColor, getCategoryIcon } from '../data/categories';

interface EnhancedTrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onEdit?: (track: Track) => void;
  onDelete?: (track: Track) => void;
  showAdminControls?: boolean;
  isPlaying?: boolean;
  className?: string;
}

const EnhancedTrackCard: React.FC<EnhancedTrackCardProps> = ({
  track,
  onPlay,
  onAddToPlaylist,
  onEdit,
  onDelete,
  showAdminControls = false,
  isPlaying = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyDisplay = (energy: number): string => {
    return '⭐'.repeat(energy);
  };

  const getMoodColor = (mood: string): string => {
    const moodColors: { [key: string]: string } = {
      'chill': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'epic': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'energetic': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'mysterious': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'uplifting': 'bg-green-500/20 text-green-400 border-green-500/30',
      'dark': 'bg-gray-700/20 text-gray-300 border-gray-600/30',
      'peaceful': 'bg-teal-500/20 text-teal-400 border-teal-500/30'
    };
    return moodColors[mood] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <motion.div
      className={`relative bg-stream-gray rounded-xl p-4 border border-stream-light/20 hover:border-stream-accent/50 transition-all duration-300 ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2, scale: 1.02 }}
      layout
    >
      {/* Track Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate mb-1">
            {track.title}
          </h4>
          <p className="text-gray-400 text-xs truncate">
            {track.artist}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
            {formatDuration(track.duration)}
          </span>
          {track.featured && (
            <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-500/30">
              ⭐ Featured
            </span>
          )}
        </div>
      </div>

      {/* Category Badge */}
      <div className="flex items-center mb-3">
        <span 
          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border"
          style={{ 
            backgroundColor: `${getCategoryColor(track.category)}20`,
            color: getCategoryColor(track.category),
            borderColor: `${getCategoryColor(track.category)}40`
          }}
        >
          {getCategoryIcon(track.category)} {track.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>

      {/* Track Metadata */}
      <div className="space-y-2 mb-4">
        {/* Energy Level */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Energy:</span>
          <span className="text-xs text-yellow-400 font-medium">
            {getEnergyDisplay(track.energy)}
          </span>
        </div>

        {/* Mood */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Mood:</span>
          <span className={`text-xs px-2 py-1 rounded-full border ${getMoodColor(track.mood)}`}>
            {track.mood}
          </span>
        </div>

        {/* BPM and Key */}
        {(track.bpm || track.key) && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Details:</span>
            <div className="flex items-center space-x-2">
              {track.bpm && (
                <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded">
                  {track.bpm} BPM
                </span>
              )}
              {track.key && (
                <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded">
                  {track.key}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Track Indicators */}
      <div className="flex flex-wrap gap-1 mb-4">
        {track.dmcaSafe && (
          <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-500/30">
            ✅ DMCA Safe
          </span>
        )}
        {track.loopFriendly && (
          <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-full border border-blue-500/30">
            🔄 Loop Friendly
          </span>
        )}
        {track.streamSafe && (
          <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded-full border border-purple-500/30">
            📹 Stream Safe
          </span>
        )}
        {track.hasIntro && (
          <span className="text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded-full border border-orange-500/30">
            🎬 Has Intro
          </span>
        )}
        {track.hasOutro && (
          <span className="text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded-full border border-orange-500/30">
            🎬 Has Outro
          </span>
        )}
      </div>

      {/* Tags */}
      {track.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {track.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {track.tags.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{track.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Track Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPlay(track)}
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            isPlaying
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-stream-accent hover:bg-stream-accent/90 text-white'
          }`}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        
        {onAddToPlaylist && (
          <button
            onClick={() => onAddToPlaylist(track)}
            className="p-2 text-gray-400 hover:text-white hover:bg-stream-light/20 rounded-lg transition-all duration-200"
            title="Add to Playlist"
          >
            ➕
          </button>
        )}
      </div>

      {/* Admin Controls - Only shown when showAdminControls is true */}
      {showAdminControls && (
        <motion.div
          className="absolute top-2 right-2 flex items-center space-x-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {onEdit && (
            <button
              onClick={() => onEdit(track)}
              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              title="Edit Track"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(track)}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
              title="Delete Track"
            >
              🗑️
            </button>
          )}
        </motion.div>
      )}

      {/* Upload Info */}
      <div className="mt-3 pt-3 border-t border-stream-light/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Uploaded: {new Date(track.uploadDate).toLocaleDateString()}</span>
          <span>by {track.uploadedBy}</span>
        </div>
        {!track.approved && (
          <div className="mt-2 text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded-full border border-orange-500/30 text-center">
            ⏳ Pending Approval
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedTrackCard;
