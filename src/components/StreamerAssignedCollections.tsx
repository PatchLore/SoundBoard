import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Streamer } from '../types/agency';
import { Client, TrackCollection } from '../services/trackStorageService';
import { Track } from '../types/track';
import trackManagementService from '../services/trackManagementService';
import streamerFavoritesService from '../services/streamerFavoritesService';
import TrackSourceBadge from './TrackSourceBadge';
import { useToast } from './Toast';
import assignmentsBackupService from '../services/assignmentsBackupService';

interface StreamerAssignedCollectionsProps {
  streamer: Streamer;
  onCollectionUnassign?: (collectionId: string) => void;
}

interface AssignedCollection {
  collection: TrackCollection;
  client: Client;
  source: 'client' | 'agency' | 'streamer';
  tracks: Track[];
}

interface CollectionWithTracks extends AssignedCollection {
  tracks: Track[];
}

const StreamerAssignedCollections: React.FC<StreamerAssignedCollectionsProps> = ({
  streamer,
  onCollectionUnassign
}) => {
  const [assignedCollections, setAssignedCollections] = useState<CollectionWithTracks[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState<string | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadAssignedCollections = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load collection assignments from localStorage (defensive parse)
      const assignmentsData = localStorage.getItem('music_collection_assignments');
      let assignments: Record<string, string[]> = {};
      try {
        assignments = assignmentsData ? JSON.parse(assignmentsData) : {};
        if (!assignments || typeof assignments !== 'object') assignments = {};
      } catch {
        assignments = {};
      }
      
      // Get all clients and their collections
      const clientsData = localStorage.getItem('music_clients');
      let clients: Client[] = [];
      try {
        clients = clientsData ? JSON.parse(clientsData) : [];
        if (!Array.isArray(clients)) clients = [];
      } catch {
        clients = [];
      }

      // Load all tracks
      const allTracks = await trackManagementService.getAllTracks();

      const allCollections: CollectionWithTracks[] = [];
      
      // Process client collections
      clients.forEach(client => {
        client.collections.forEach(collection => {
          const assignedStreamerIds = assignments[collection.id] || [];
          if (assignedStreamerIds.includes(streamer.id)) {
            // Get tracks for this collection
            const collectionTracks = allTracks.filter(track => 
              collection.tracks.includes(track.id)
            );
            
            allCollections.push({
              collection,
              client,
              source: client.id === 'agency_default' ? 'agency' : 'client',
              tracks: collectionTracks
            });
          }
        });
      });

      setAssignedCollections(allCollections);
      
      // Expand all collections by default
      const collectionIds = allCollections.map(c => c.collection.id);
      setExpandedCollections(new Set(collectionIds));
    } catch (error) {
      console.error('Error loading assigned collections:', error);
    } finally {
      setLoading(false);
    }
  }, [streamer.id]);

  useEffect(() => {
    loadAssignedCollections();
  }, [loadAssignedCollections]);

  // Toggle collection expansion
  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  // Toggle favorite for a track
  const toggleFavorite = (track: Track) => {
    const isFavorited = streamerFavoritesService.isFavorited(streamer.id, track.id);
    
    if (isFavorited) {
      streamerFavoritesService.removeFromFavorites(streamer.id, track.id);
      showToast({
        type: 'info',
        title: 'Removed from Favorites',
        message: `"${track.title}" removed from favorites`
      });
    } else {
      streamerFavoritesService.addToFavorites(streamer.id, track.id);
      showToast({
        type: 'success',
        title: 'Added to Favorites',
        message: `"${track.title}" added to favorites`
      });
    }
  };

  // Play track preview
  const handlePlayTrack = (track: Track) => {
    if (playingTrackId === track.id) {
      setPlayingTrackId(null);
      // Stop audio here if needed
    } else {
      setPlayingTrackId(track.id);
      // Play audio here if needed
    }
  };

  // Get track source for badge display
  const getTrackSource = (track: Track): 'agency' | 'streamer' => {
    const isFavorited = streamerFavoritesService.isFavorited(streamer.id, track.id);
    return isFavorited ? 'streamer' : 'agency';
  };

  const handleUnassignCollection = (collectionId: string) => {
    try {
      // Backup before changing assignments
      assignmentsBackupService.backup('unassign_collection');
      // Get current assignments
      const assignmentsData = localStorage.getItem('music_collection_assignments');
      const assignments = assignmentsData ? JSON.parse(assignmentsData) : {};
      
      // Remove this streamer from the collection's assignments
      const currentAssignments = assignments[collectionId] || [];
      const updatedAssignments = currentAssignments.filter((id: string) => id !== streamer.id);
      
      if (updatedAssignments.length === 0) {
        delete assignments[collectionId];
      } else {
        assignments[collectionId] = updatedAssignments;
      }
      
      // Save back to localStorage
      localStorage.setItem('music_collection_assignments', JSON.stringify(assignments));
      
      // Update local state
      setAssignedCollections(prev => 
        prev.filter(item => item.collection.id !== collectionId)
      );
      
      // Show success toast
      const collection = assignedCollections.find(item => item.collection.id === collectionId);
      showToast({
        type: 'success',
        title: 'Collection Unassigned',
        message: `"${collection?.collection.name}" unassigned from ${streamer.name}`
      });
      
      // Call parent callback
      if (onCollectionUnassign) {
        onCollectionUnassign(collectionId);
      }
      
      // Close confirmation dialog
      setShowUnassignConfirm(null);
    } catch (error) {
      console.error('Error unassigning collection:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to unassign collection. Please try again.'
      });
    }
  };

  const handleRestoreAssignments = () => {
    if (!assignmentsBackupService.hasBackup()) {
      showToast({ type: 'info', title: 'No Backup Found', message: 'There is no recent backup to restore.' });
      return;
    }
    const meta = assignmentsBackupService.getBackupMeta();
    const confirmed = window.confirm(
      `Restore last assignments backup${meta?.timestamp ? ` from ${new Date(meta.timestamp).toLocaleString()}` : ''}?`
    );
    if (!confirmed) return;
    const ok = assignmentsBackupService.restore();
    if (ok) {
      showToast({ type: 'success', title: 'Assignments Restored', message: 'Previous assignments have been restored.' });
      loadAssignedCollections();
    } else {
      showToast({ type: 'error', title: 'Restore Failed', message: 'Could not restore assignments.' });
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'client':
        return (
          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full font-medium">
            Client Collection
          </span>
        );
      case 'agency':
        return (
          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full font-medium">
            Agency Collection
          </span>
        );
      case 'streamer':
        return (
          <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full font-medium">
            Streamer Favorite
          </span>
        );
      default:
        return null;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'client':
        return '🏢';
      case 'agency':
        return '🏛️';
      case 'streamer':
        return '⭐';
      default:
        return '📁';
    }
  };

  if (loading) {
    return (
      <div className="mt-6 border-t border-gray-700 pt-6">
        <h4 className="text-lg font-semibold text-white mb-3">Assigned Collections</h4>
        <p className="text-gray-400 text-sm">Loading assigned collections...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-gray-700 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">Assigned Collections</h4>
        <button
          onClick={handleRestoreAssignments}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors border border-gray-600"
        >
          Restore last assignments
        </button>
      </div>
      
      {assignedCollections.length === 0 ? (
        <div className="text-center py-8 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-gray-400 text-sm mb-2">No collections assigned yet.</p>
          <p className="text-gray-500 text-xs">Assign collections from Clients or Agency to add tracks here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignedCollections.map((item) => {
            const isExpanded = expandedCollections.has(item.collection.id);
            return (
              <motion.div
                key={item.collection.id}
                className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Collection Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <button
                          onClick={() => toggleCollection(item.collection.id)}
                          className="flex items-center space-x-2 text-white font-medium hover:text-blue-400 transition-colors"
                        >
                          <span className="text-lg">🎵</span>
                          <span className="truncate">{item.collection.name}</span>
                          <motion.span
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-400"
                          >
                            ▶
                          </motion.span>
                        </button>
                        {getSourceBadge(item.source)}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span className="text-xs">{getSourceIcon(item.source)}</span>
                        <span>From: {item.client.name}</span>
                        <span>•</span>
                        <span>{item.tracks.length} tracks</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowUnassignConfirm(item.collection.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 text-sm rounded transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                      aria-label={`Unassign collection "${item.collection.name}"`}
                    >
                      Unassign
                    </button>
                  </div>
                </div>

                {/* Collection Tracks (Collapsible) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-700 p-4 bg-gray-700/30">
                        {item.tracks.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">No tracks in this collection.</p>
                        ) : (
                          <div className="space-y-2">
                            {item.tracks.map((track) => {
                              const isFavorited = streamerFavoritesService.isFavorited(streamer.id, track.id);
                              const trackSource = getTrackSource(track);
                              return (
                                <motion.div
                                  key={track.id}
                                  whileHover={{ scale: 1.01 }}
                                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h5 className="text-white font-medium truncate">{track.title}</h5>
                                      <TrackSourceBadge source={trackSource} />
                                      {isFavorited && (
                                        <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded-full font-medium">
                                          ⭐ Favorited
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
                                      onClick={() => toggleFavorite(track)}
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
                                      onClick={() => handlePlayTrack(track)}
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
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}


      {/* Unassign Confirmation Modal */}
      {showUnassignConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unassign-confirm-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h3 id="unassign-confirm-title" className="text-lg font-semibold text-white mb-4">
              Confirm Unassign
            </h3>
            
            <p className="text-gray-400 mb-6">
              Unassign '{assignedCollections.find(item => item.collection.id === showUnassignConfirm)?.collection.name}' from {streamer.name}?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUnassignConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-gray-500 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnassignCollection(showUnassignConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                Unassign
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default StreamerAssignedCollections;