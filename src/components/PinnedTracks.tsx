import React from 'react';
import { motion } from 'framer-motion';
import { Track } from '../types/track';
import TrackSourceBadge from './TrackSourceBadge';

interface PinnedTracksProps {
  recentlyPlayed: Track[];
  favorited: Track[];
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
  playingTrackId: string | null;
  getTrackSource: (track: Track) => 'agency' | 'streamer';
  className?: string;
}

const PinnedTracks: React.FC<PinnedTracksProps> = ({
  recentlyPlayed,
  favorited,
  onPlayTrack,
  onToggleFavorite,
  playingTrackId,
  getTrackSource,
  className = ""
}) => {
  const renderTrack = (track: Track, isFavorited: boolean) => (
    <motion.div
      key={track.id}
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h5 className="text-white font-medium truncate">{track.title}</h5>
          <TrackSourceBadge source={getTrackSource(track)} />
          {isFavorited && (
            <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded-full font-medium">
              ⭐ Pinned
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm truncate">{track.artist}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">
            {track.category}
          </span>
          <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded">
            {track.mood}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-3">
        <button
          onClick={() => onToggleFavorite(track)}
          className={`p-2 rounded transition-colors ${
            isFavorited 
              ? 'text-yellow-400 hover:text-yellow-300' 
              : 'text-gray-400 hover:text-yellow-400'
          }`}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          ⭐
        </button>
        <button
          onClick={() => onPlayTrack(track)}
          className={`p-2 rounded transition-colors ${
            playingTrackId === track.id
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title={playingTrackId === track.id ? 'Stop' : 'Play Preview'}
        >
          {playingTrackId === track.id ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-600/30">
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
            🕒 Recently Played ({recentlyPlayed.length})
          </h3>
          <div className="space-y-2">
            {recentlyPlayed.slice(0, 5).map(track => renderTrack(track, false))}
          </div>
        </div>
      )}

      {/* Favorited Tracks */}
      {favorited.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-600/30">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
            ⭐ Favorited ({favorited.length})
          </h3>
          <div className="space-y-2">
            {favorited.slice(0, 5).map(track => renderTrack(track, true))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PinnedTracks;



