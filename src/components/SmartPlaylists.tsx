import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../types/track';
import { UserRole } from '../types/agency';
import trackManagementService from '../services/trackManagementService';
import EnhancedTrackCard from './EnhancedTrackCard';
import RoleGuard from './RoleGuard';

interface SmartPlaylistsProps {
  userRole: UserRole;
}

interface Playlist {
  name: string;
  description: string;
  icon: string;
  tracks: Track[];
  color: string;
}

const SmartPlaylists: React.FC<SmartPlaylistsProps> = ({ userRole }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      const smartPlaylists = await trackManagementService.getSmartPlaylists();
      
      const formattedPlaylists: Playlist[] = [
        {
          name: 'Gaming Essentials',
          description: 'Perfect tracks for gaming sessions',
          icon: '🎮',
          tracks: smartPlaylists['Gaming Essentials'] || [],
          color: '#4ecdc4'
        },
        {
          name: 'Stream Workflow',
          description: 'Music for stream beginnings, breaks, and endings',
          icon: '🎬',
          tracks: smartPlaylists['Stream Workflow'] || [],
          color: '#ff6b6b'
        },
        {
          name: 'High Energy',
          description: 'Pump-up music for exciting moments',
          icon: '⚡',
          tracks: smartPlaylists['High Energy'] || [],
          color: '#f9ca24'
        },
        {
          name: 'Chill Vibes',
          description: 'Relaxing background music',
          icon: '🌙',
          tracks: smartPlaylists['Chill Vibes'] || [],
          color: '#6c5ce7'
        },
        {
          name: 'Featured Tracks',
          description: 'Hand-picked premium tracks',
          icon: '⭐',
          tracks: smartPlaylists['Featured Tracks'] || [],
          color: '#fd79a8'
        },
        {
          name: 'Recently Added',
          description: 'Latest additions to the library',
          icon: '🆕',
          tracks: smartPlaylists['Recently Added'] || [],
          color: '#00b894'
        }
      ];

      setPlaylists(formattedPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (currentlyPlaying === track.id) {
      setCurrentlyPlaying(null);
      // Stop audio logic here
    } else {
      setCurrentlyPlaying(track.id);
      // Play audio logic here
    }
  };

  const handleAddToPlaylist = (track: Track) => {
    // Add to playlist logic here
    console.log('Adding track to playlist:', track.title);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stream-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          🎵 Smart Playlists
        </h1>
        <p className="text-xl text-gray-400 mb-4">
          Auto-generated playlists based on your music library
        </p>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <motion.div
            key={playlist.name}
            className="bg-stream-gray rounded-xl p-6 border border-stream-light/20 hover:border-stream-accent/50 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedPlaylist(playlist)}
            whileHover={{ y: -2, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center">
              <div 
                className="text-4xl mb-4 mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${playlist.color}20`, color: playlist.color }}
              >
                {playlist.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{playlist.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{playlist.description}</p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="text-gray-500">{playlist.tracks.length} tracks</span>
                <span className="text-stream-accent">▶️ Play All</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Playlist Detail Modal */}
      <AnimatePresence>
        {selectedPlaylist && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-stream-darker rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div 
                    className="text-4xl w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${selectedPlaylist.color}20`, color: selectedPlaylist.color }}
                  >
                    {selectedPlaylist.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedPlaylist.name}</h2>
                    <p className="text-gray-400">{selectedPlaylist.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlaylist(null)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Playlist Actions */}
              <div className="flex items-center space-x-4 mb-6">
                <button className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200">
                  ▶️ Play All ({selectedPlaylist.tracks.length} tracks)
                </button>
                <button className="bg-stream-gray border border-stream-light/30 hover:bg-stream-light/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200">
                  🔀 Shuffle Play
                </button>
                <RoleGuard userRole={userRole} allowedRoles={['agency']}>
                  <button className="bg-stream-gray border border-stream-light/30 hover:bg-stream-light/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200">
                    ✏️ Edit Playlist
                  </button>
                </RoleGuard>
              </div>

              {/* Tracks List */}
              <div className="space-y-4">
                {selectedPlaylist.tracks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🎵</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No tracks in this playlist</h3>
                    <p className="text-gray-400">Tracks will appear here as they're added to the library.</p>
                  </div>
                ) : (
                  selectedPlaylist.tracks.map((track) => (
                    <EnhancedTrackCard
                      key={track.id}
                      track={track}
                      onPlay={handlePlayTrack}
                      onAddToPlaylist={handleAddToPlaylist}
                      isPlaying={currentlyPlaying === track.id}
                      className="!flex-row items-center"
                    />
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartPlaylists;

