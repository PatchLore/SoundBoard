import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track, FilterOptions } from '../types/track';
import { UserRole } from '../types/agency';
import { STREAMING_CATEGORIES, getCategoryDisplayName, getCategoryColor, getCategoryIcon } from '../data/categories';
import trackManagementService from '../services/trackManagementService';
import TrackCard from './TrackCard';
import RoleGuard from './RoleGuard';
import TrackUploader from './admin/TrackUploader';

interface EnhancedMusicLibraryProps {
  userRole: UserRole;
}

const EnhancedMusicLibrary: React.FC<EnhancedMusicLibraryProps> = ({ userRole }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [categories, setCategories] = useState(STREAMING_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load tracks on component mount
  useEffect(() => {
    loadTracks();
  }, []);

  const applyFilters = useCallback(async () => {
    try {
      let filtered = [...tracks];

      // Apply search query
      if (searchQuery.trim()) {
        const searchResults = await trackManagementService.searchTracks(searchQuery);
        filtered = searchResults;
      }

      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter(track => track.category === selectedCategory);
      }

      // Apply advanced filters
      if (Object.keys(filters).length > 0) {
        const advancedFiltered = await trackManagementService.filterTracks(filters);
        filtered = filtered.filter(track => 
          advancedFiltered.some(ft => ft.id === track.id)
        );
      }

      setFilteredTracks(filtered);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    }
  }, [tracks, filters, searchQuery, selectedCategory]);

  // Filter tracks when filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadTracks = async () => {
    try {
      setIsLoading(true);
      const allTracks = await trackManagementService.getAllTracks();
      const allCategories = await trackManagementService.getCategories();
      
      setTracks(allTracks);
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackUpload = (newTrack: Track) => {
    setTracks(prev => [newTrack, ...prev]);
    setShowUploader(false);
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



  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const getFilteredTrackCount = () => {
    return filteredTracks.length;
  };

  const getTotalTrackCount = () => {
    return tracks.length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stream-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading music library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          🎵 Professional Music Library
        </h1>
        <p className="text-xl text-gray-400 mb-4">
          Hand-curated royalty-free music for streamers
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span>{getTotalTrackCount()} tracks available</span>
          <span className="text-stream-accent">⭐ Premium Collection</span>
        </div>
      </div>

      {/* Admin Controls - Agency Only */}
      <RoleGuard userRole={userRole} allowedRoles={['agency']}>
        <motion.div
          className="bg-stream-gray rounded-xl p-6 border border-stream-light/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">📁 Track Library Management</h3>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowUploader(true)}
              className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
            >
              + Add New Track
            </button>
            <button className="bg-stream-gray border border-stream-light/30 hover:bg-stream-light/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200">
              📁 Bulk Upload
            </button>
            <button className="bg-stream-gray border border-stream-light/30 hover:bg-stream-light/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200">
              🎵 Import Playlist
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-stream-darker rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Recently Added:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              {tracks.slice(0, 3).map(track => (
                <li key={track.id}>• {track.title} - {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')} - {track.energy === 5 ? 'High Energy' : track.energy <= 2 ? 'Low Energy' : 'Medium Energy'}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </RoleGuard>

      {/* Search and Filters */}
      <div className="bg-stream-gray rounded-xl p-6 border border-stream-light/20">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tracks, artists, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-stream-accent text-white'
                  : 'bg-stream-darker text-gray-400 hover:text-white'
              }`}
            >
              📱 Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-stream-accent text-white'
                  : 'bg-stream-darker text-gray-400 hover:text-white'
              }`}
            >
              📋 List
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-stream-accent text-white'
                  : 'bg-stream-darker text-gray-400 hover:text-white border border-stream-light/20'
              }`}
            >
              All ({getTotalTrackCount()})
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-stream-accent text-white'
                    : 'bg-stream-darker text-gray-400 hover:text-white border border-stream-light/20'
                }`}
                style={{
                  borderColor: selectedCategory === category.id ? 'transparent' : getCategoryColor(category.id)
                }}
              >
                <span>{getCategoryIcon(category.id)}</span>
                <span>{category.name}</span>
                <span className="text-xs opacity-75">({category.trackCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Energy Level</label>
            <select
              value={filters.energy?.join(',') || ''}
              onChange={(e) => {
                const values = e.target.value ? e.target.value.split(',').map(v => parseInt(v)) : undefined;
                setFilters(prev => ({ ...prev, energy: values }));
              }}
              className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
            >
              <option value="">All Levels</option>
              <option value="1,2">Low (1-2)</option>
              <option value="3">Medium (3)</option>
              <option value="4,5">High (4-5)</option>
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
            <select
              value={filters.mood?.join(',') || ''}
              onChange={(e) => {
                const values = e.target.value ? e.target.value.split(',') : undefined;
                setFilters(prev => ({ ...prev, mood: values }));
              }}
              className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
            >
              <option value="">All Moods</option>
              <option value="chill,peaceful">Chill & Peaceful</option>
              <option value="epic,energetic">Epic & Energetic</option>
              <option value="mysterious,dark">Mysterious & Dark</option>
              <option value="uplifting">Uplifting</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
            <select
              value={filters.duration ? `${filters.duration.min}-${filters.duration.max}` : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const [min, max] = e.target.value.split('-').map(v => parseInt(v));
                  setFilters(prev => ({ ...prev, duration: { min, max } }));
                } else {
                  setFilters(prev => ({ ...prev, duration: undefined }));
                }
              }}
              className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
            >
              <option value="">Any Duration</option>
              <option value="0-60">Under 1 min</option>
              <option value="60-180">1-3 min</option>
              <option value="180-300">3-5 min</option>
              <option value="300-600">5-10 min</option>
            </select>
          </div>

          {/* Loop Friendly */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Loop Friendly</label>
            <select
              value={filters.loopFriendly?.toString() || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? undefined : e.target.value === 'true';
                setFilters(prev => ({ ...prev, loopFriendly: value }));
              }}
              className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
            >
              <option value="">Any</option>
              <option value="true">Loop Friendly</option>
              <option value="false">Not Loop Friendly</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(Object.keys(filters).length > 0 || searchQuery || selectedCategory) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-stream-accent hover:text-stream-accent/80 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {getFilteredTrackCount()} of {getTotalTrackCount()} tracks
          {selectedCategory && ` in ${getCategoryDisplayName(selectedCategory)}`}
        </p>
      </div>

      {/* Tracks Grid/List */}
      <AnimatePresence mode="wait">
        {filteredTracks.length === 0 ? (
          <motion.div
            key="no-results"
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-white mb-2">No tracks found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="tracks-grid"
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredTracks.map(track => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={handlePlayTrack}
                onPause={() => setCurrentlyPlaying(null)}
                isPlaying={currentlyPlaying === track.id}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track Uploader Modal */}
      <AnimatePresence>
        {showUploader && (
          <TrackUploader
            onTrackUpload={handleTrackUpload}
            onClose={() => setShowUploader(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedMusicLibrary;
