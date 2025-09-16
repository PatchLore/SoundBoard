import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Streamer } from '../types/agency';
import { Track } from '../types/track';
import trackManagementService from '../services/trackManagementService';
import unifiedAudioController from '../services/unifiedAudioController';
import streamerFavoritesService from '../services/streamerFavoritesService';
import TrackFilterService, { TrackFilterOptions, TrackGroup as TrackGroupType } from '../services/trackFilterService';
import TrackSourceBadge from './TrackSourceBadge';
import TrackSearch from './TrackSearch';
import TrackGroup from './TrackGroup';
import TrackPagination from './TrackPagination';
import PinnedTracks from './PinnedTracks';
import PlaceholderAvatar from './PlaceholderAvatar';
import { useToast } from './Toast';

interface StreamerSoundboardManagerProps {
  streamer: Streamer;
  onClose: () => void;
  onStreamerUpdate?: (updatedStreamer: Streamer) => void;
}

const StreamerSoundboardManager: React.FC<StreamerSoundboardManagerProps> = ({
  streamer,
  onClose,
  onStreamerUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'soundboard' | 'tracks' | 'settings'>('soundboard');
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [streamerTracks, setStreamerTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentStreamer, setCurrentStreamer] = useState<Streamer>(streamer);
  
  // New UX state
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'mood' | 'category' | 'collection' | 'none'>('mood');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'recent' | 'favorite'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filteredGroups, setFilteredGroups] = useState<TrackGroupType[]>([]);
  const [pagination, setPagination] = useState({
    tracks: [] as Track[],
    totalPages: 0,
    hasMore: false,
    totalItems: 0
  });

  const { showToast } = useToast();

  const loadStreamerData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all available tracks
      const allTracks = await trackManagementService.getAllTracks();
      console.log('🎵 Loaded tracks:', allTracks.length, 'tracks');
      setAvailableTracks(allTracks);
      
            // Get tracks from assigned collections and favorites
            const assignmentsData = localStorage.getItem('music_collection_assignments');
            let assignments: Record<string, string[]> = {};
            try {
              assignments = assignmentsData ? JSON.parse(assignmentsData) : {};
              if (!assignments || typeof assignments !== 'object') assignments = {};
            } catch {
              assignments = {};
            }
            
            // Get all clients and their collections
            let clients: any[] = [];
            try {
              const clientsData = localStorage.getItem('music_clients');
              clients = clientsData ? JSON.parse(clientsData) : [];
              if (!Array.isArray(clients)) clients = [];
            } catch {
              clients = [];
            }
            const assignedCollectionTrackIds: string[] = [];
            
            clients.forEach((client: any) => {
              client.collections.forEach((collection: any) => {
                const assignedStreamerIds = assignments[collection.id] || [];
                if (assignedStreamerIds.includes(currentStreamer.id)) {
                  assignedCollectionTrackIds.push(...collection.tracks);
                }
              });
            });
            
            // Load streamer's favorites from localStorage
            const favoriteTrackIds = streamerFavoritesService.getFavorites(currentStreamer.id);
      
      // Combine all tracks for the streamer
      const allStreamerTrackIds = [...favoriteTrackIds, ...assignedCollectionTrackIds];
      const uniqueTrackIds = allStreamerTrackIds.filter((id, index) => allStreamerTrackIds.indexOf(id) === index);
      const streamerTracksData = allTracks.filter(track => 
        uniqueTrackIds.includes(track.id)
      );
      
            console.log('🎵 Streamer total tracks:', streamerTracksData.length, 'tracks');
            console.log('🎵 Favorite tracks:', favoriteTrackIds.length);
            console.log('🎵 Assigned collection tracks:', assignedCollectionTrackIds.length);
      
      setStreamerTracks(streamerTracksData);
      
    } catch (error) {
      console.error('Error loading streamer data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentStreamer.id]);

  // Update currentStreamer when streamer prop changes
  useEffect(() => {
    setCurrentStreamer(streamer);
  }, [streamer]);

  useEffect(() => {
    loadStreamerData();
  }, [loadStreamerData]);

  // Apply filters and update groups/pagination
  const applyFilters = useCallback(() => {
    const options: TrackFilterOptions = {
      searchQuery,
      groupBy,
      sortBy,
      itemsPerPage,
      currentPage
    };

    const result = TrackFilterService.processTracks(streamerTracks, options);
    setFilteredGroups(result.groups);
    setPagination(result.pagination);
  }, [streamerTracks, searchQuery, groupBy, sortBy, itemsPerPage, currentPage]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Reset to first page when search or grouping changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, groupBy, sortBy]);

  // Toggle favorite status for a track
  const toggleFavorite = (track: Track) => {
    const isFavorited = streamerFavoritesService.isFavorited(currentStreamer.id, track.id);
    if (isFavorited) {
      streamerFavoritesService.removeFromFavorites(currentStreamer.id, track.id);
      // If the track isn't also present via assigned collections, optimistically remove from UI
      if (!isTrackFromAssignedCollections(track.id)) {
        setStreamerTracks(prev => prev.filter(t => t.id !== track.id));
      }
    } else {
      streamerFavoritesService.addToFavorites(currentStreamer.id, track.id);
      // Ensure it appears in the assigned list immediately
      setStreamerTracks(prev => (prev.some(t => t.id === track.id) ? prev : [...prev, track]));
    }
  };

  // Get track source (agency or streamer)
  const getTrackSource = (track: Track): 'agency' | 'streamer' => {
    const isFavorited = streamerFavoritesService.isFavorited(currentStreamer.id, track.id);
    return isFavorited ? 'streamer' : 'agency';
  };

  // Helper: check if a track comes from assigned collections for this streamer
  const isTrackFromAssignedCollections = (trackId: string): boolean => {
    try {
      const assignmentsData = localStorage.getItem('music_collection_assignments');
      let assignments: Record<string, string[]> = {};
      try {
        assignments = assignmentsData ? JSON.parse(assignmentsData) : {};
        if (!assignments || typeof assignments !== 'object') assignments = {};
      } catch {
        assignments = {};
      }
      let clients: any[] = [];
      try {
        const clientsData = localStorage.getItem('music_clients');
        clients = clientsData ? JSON.parse(clientsData) : [];
        if (!Array.isArray(clients)) clients = [];
      } catch {
        clients = [];
      }
      for (const client of clients) {
        for (const collection of client.collections || []) {
          const assignedStreamerIds = assignments[collection.id] || [];
          if (assignedStreamerIds.includes(currentStreamer.id) && collection.tracks?.includes(trackId)) {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to resolve assigned collections for track:', e);
    }
    return false;
  };

  // New UX handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleGroupByChange = (newGroupBy: 'mood' | 'category' | 'collection' | 'none') => {
    setGroupBy(newGroupBy);
  };

  const handleSortByChange = (newSortBy: 'title' | 'artist' | 'recent' | 'favorite') => {
    setSortBy(newSortBy);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Get recently played and favorited tracks for pinned section
  const recentlyPlayed = TrackFilterService.getRecentlyPlayed(streamerTracks, 5);
  const mostFavorited = TrackFilterService.getMostFavorited(streamerTracks, 5);

  // Render function for individual tracks
  const renderTrack = (track: Track, index: number) => {
    const isFavorited = streamerFavoritesService.isFavorited(currentStreamer.id, track.id);
    const source = getTrackSource(track);
    
    return (
      <motion.div
        key={track.id}
        whileHover={{ scale: 1.01 }}
        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h5 className="text-white font-medium truncate">{track.title}</h5>
            <TrackSourceBadge source={source} />
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
  };


  const addTrackToStreamer = (track: Track) => {
    console.log('🎵 Adding track to streamer favorites:', track.title, 'for streamer:', currentStreamer.name);
    
    // Use favorites service as the source of truth
    if (streamerFavoritesService.isFavorited(currentStreamer.id, track.id)) {
      console.log('🎵 Track already in favorites, skipping');
      return;
    }
    
    streamerFavoritesService.addToFavorites(currentStreamer.id, track.id);
    // Optimistically add to UI without full reload
    setStreamerTracks(prev => (prev.some(t => t.id === track.id) ? prev : [...prev, track]));
    // Defer a quiet refresh to reconcile any external changes
    setTimeout(() => loadStreamerData(), 0);
  };

  const removeTrackFromStreamer = (trackId: string) => {
    console.log('🗑️ Remove requested for track:', trackId, 'streamer:', currentStreamer.name);

    // If it's favorited, just remove from favorites
    if (streamerFavoritesService.isFavorited(currentStreamer.id, trackId)) {
      streamerFavoritesService.removeFromFavorites(currentStreamer.id, trackId);
      // Optimistically update UI without a full reload
      if (!isTrackFromAssignedCollections(trackId)) {
        setStreamerTracks(prev => prev.filter(t => t.id !== trackId));
      }
      // Defer a quiet refresh
      setTimeout(() => loadStreamerData(), 0);
      return;
    }

    // Otherwise, the track is present via assigned collections. Prevent mass removals.
    // Inform the user to unassign the specific collection(s) instead.
    showToast({
      type: 'info',
      title: 'Track comes from assigned collections',
      message: 'To remove it, unassign the collection in Assigned Collections.'
    });
  };

  const availableForStreamer = availableTracks.filter(track => {
    // Exclude tracks that are already in streamer's favorites (service is source of truth)
    if (streamerFavoritesService.isFavorited(currentStreamer.id, track.id)) {
      return false;
    }
    
    // Exclude tracks that are in assigned collections
    const assignmentsData = localStorage.getItem('music_collection_assignments');
    let assignments: Record<string, string[]> = {};
    try {
      assignments = assignmentsData ? JSON.parse(assignmentsData) : {};
      if (!assignments || typeof assignments !== 'object') assignments = {};
    } catch {
      assignments = {};
    }
    
    let clients: any[] = [];
    try {
      const clientsData = localStorage.getItem('music_clients');
      clients = clientsData ? JSON.parse(clientsData) : [];
      if (!Array.isArray(clients)) clients = [];
    } catch {
      clients = [];
    }
    const assignedCollectionTracks: string[] = [];
    
    clients.forEach((client: any) => {
      client.collections.forEach((collection: any) => {
        const assignedStreamerIds = assignments[collection.id] || [];
        if (assignedStreamerIds.includes(currentStreamer.id)) {
          assignedCollectionTracks.push(...collection.tracks);
        }
      });
    });
    
    return !assignedCollectionTracks.includes(track.id);
  });

  const handlePlayTrack = async (track: Track) => {
    try {
      if (playingTrackId === track.id) {
        // If same track is playing, stop it
        unifiedAudioController.stop();
        setPlayingTrackId(null);
      } else {
        // Stop current track and play new one
        unifiedAudioController.stop();
        await unifiedAudioController.playTrack(track);
        setPlayingTrackId(track.id);
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleStopTrack = () => {
    unifiedAudioController.stop();
    setPlayingTrackId(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading streamer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-gray-900 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <PlaceholderAvatar name={currentStreamer.name} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentStreamer.name}</h2>
                  <p className="text-gray-400">{currentStreamer.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      currentStreamer.isActive 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {currentStreamer.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {streamerTracks.length} tracks assigned
                    </span>
                  </div>
                </div>
              </div>
            <div className="flex items-center space-x-3">
              {playingTrackId && (
                <button
                  onClick={handleStopTrack}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  title="Stop all audio"
                >
                  Stop Audio
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'soundboard', label: 'Soundboard Preview', icon: '🎵' },
              { id: 'tracks', label: 'Track Management', icon: '📀' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'soundboard' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {currentStreamer.name}'s Soundboard Preview
              </h3>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-sm mb-6">
                  This shows how {currentStreamer.name} will see their soundboard. 
                  Use the Track Management tab to assign tracks to this streamer.
                </p>
                
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <TrackSearch
                    onSearch={handleSearch}
                    placeholder="Search tracks by title, artist, or tags..."
                    className="w-full"
                  />
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-400">Group by:</label>
                      <select
                        value={groupBy}
                        onChange={(e) => handleGroupByChange(e.target.value as any)}
                        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="mood">Mood</option>
                        <option value="category">Category</option>
                        <option value="collection">Collection</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-400">Sort by:</label>
                      <select
                        value={sortBy}
                        onChange={(e) => handleSortByChange(e.target.value as any)}
                        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="recent">Recent</option>
                        <option value="favorite">Most Played</option>
                        <option value="title">Title</option>
                        <option value="artist">Artist</option>
                      </select>
                    </div>
                            </div>
                          </div>

                {/* Pinned Tracks Section */}
                {(recentlyPlayed.length > 0 || mostFavorited.length > 0) && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      📌 Pinned Tracks
                    </h4>
                    <PinnedTracks
                      recentlyPlayed={recentlyPlayed}
                      favorited={mostFavorited}
                      onPlayTrack={handlePlayTrack}
                      onToggleFavorite={toggleFavorite}
                      playingTrackId={playingTrackId}
                      getTrackSource={getTrackSource}
                    />
                  </div>
                )}
                
                {/* Track Groups */}
                {filteredGroups.length > 0 ? (
                  <div className="space-y-4">
                    {filteredGroups.map((group) => (
                      <TrackGroup
                        key={group.id}
                        title={group.title}
                        count={group.count}
                        tracks={group.tracks}
                        renderTrack={renderTrack}
                        defaultCollapsed={groupBy !== 'none'}
                        emptyMessage={`No tracks found in ${group.title.toLowerCase()}`}
                      />
                    ))}
                      </div>
                ) : (
                  <div className="text-center py-12 bg-gray-700/50 rounded-lg">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No tracks found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchQuery 
                        ? `No tracks match "${searchQuery}"` 
                        : "No tracks assigned to this streamer yet"
                      }
                    </p>
                    {!searchQuery && (
                      <p className="text-gray-500 text-sm">Use the Track Management tab to assign tracks.</p>
                    )}
                    </div>
                  )}

                {/* Pagination */}
                {pagination.totalItems > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <TrackPagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      hasMore={pagination.hasMore}
                      onLoadMore={handleLoadMore}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={pagination.totalItems}
                    />
                </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tracks' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Tracks */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Available Tracks ({availableForStreamer.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableForStreamer.map((track) => (
                      <motion.div
                        key={track.id}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium">{track.title}</h4>
                            <TrackSourceBadge source="agency" />
                          </div>
                          <p className="text-gray-400 text-sm">{track.artist}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                              {track.category}
                            </span>
                            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                              {track.mood}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePlayTrack(track)}
                            className={`p-2 rounded transition-colors ${
                              playingTrackId === track.id
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title={playingTrackId === track.id ? 'Stop' : 'Preview'}
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
                          <button
                            onClick={() => toggleFavorite(track)}
                            className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                            title="Add to favorites"
                          >
                            ⭐
                          </button>
                          <button
                            onClick={() => addTrackToStreamer(track)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                          >
                            Assign
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Assigned Tracks */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Assigned Tracks ({streamerTracks.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {streamerTracks.map((track) => (
                      <motion.div
                        key={track.id}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium">{track.title}</h4>
                            <TrackSourceBadge source={getTrackSource(track)} />
                          </div>
                          <p className="text-gray-400 text-sm">{track.artist}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                              {track.category}
                            </span>
                            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                              {track.mood}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePlayTrack(track)}
                            className={`p-2 rounded transition-colors ${
                              playingTrackId === track.id
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title={playingTrackId === track.id ? 'Stop' : 'Play'}
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
                          <button
                            onClick={() => toggleFavorite(track)}
                            className={`p-1 transition-colors ${
                              streamerFavoritesService.isFavorited(currentStreamer.id, track.id)
                                ? 'text-yellow-400 hover:text-yellow-300'
                                : 'text-gray-400 hover:text-yellow-400'
                            }`}
                            title={streamerFavoritesService.isFavorited(currentStreamer.id, track.id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            ⭐
                          </button>
                          <button
                            onClick={() => removeTrackFromStreamer(track.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Streamer Settings</h3>
              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Volume
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={streamer.soundboardConfig.volumeDefaults}
                      className="w-full"
                      readOnly
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                      <span>0%</span>
                      <span>{streamer.soundboardConfig.volumeDefaults}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Mood
                    </label>
                    <div className="px-3 py-2 bg-gray-700 rounded-lg text-white">
                      {streamer.soundboardConfig.defaultMood}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Genre
                    </label>
                    <div className="px-3 py-2 bg-gray-700 rounded-lg text-white">
                      {streamer.soundboardConfig.defaultGenre}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme
                    </label>
                    <div className="px-3 py-2 bg-gray-700 rounded-lg text-white">
                      {streamer.soundboardConfig.theme}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-white font-medium mb-2">Usage Statistics</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Play Time:</span>
                      <span className="text-white ml-2">
                        {Math.round(streamer.usageStats.totalPlayTime / 3600)}h
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tracks Played:</span>
                      <span className="text-white ml-2">{streamer.usageStats.tracksPlayed}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Active:</span>
                      <span className="text-white ml-2">
                        {new Date(streamer.usageStats.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StreamerSoundboardManager;
