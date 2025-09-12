import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track, FilterOptions } from '../types/track';
import { UserRole } from '../types/agency';
import { STREAMING_CATEGORIES, getCategoryDisplayName, getCategoryColor, getCategoryIcon } from '../data/categories';
import trackManagementService from '../services/trackManagementService';
import TrackCard from './TrackCard';
import RoleGuard from './RoleGuard';
import TrackUploader from './admin/TrackUploader';
import BulkUploadModal from './BulkUploadModal';
import ImportPlaylistModal from './ImportPlaylistModal';
import TrackEditModal from './TrackEditModal';
import { FiltersBar } from './FiltersBar';
import { SkeletonGrid } from './Skeleton';

interface EnhancedMusicLibraryProps {
  userRole: UserRole;
}

const EnhancedMusicLibrary: React.FC<EnhancedMusicLibraryProps> = ({ userRole }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [categories, setCategories] = useState(STREAMING_CATEGORIES);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'energy' | 'duration' | 'uploadDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showImportPlaylist, setShowImportPlaylist] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load tracks on component mount
  useEffect(() => {
    loadTracks();
  }, []);

  // Initialize filteredTracks when tracks are loaded
  useEffect(() => {
    if (tracks && tracks.length > 0) {
      setFilteredTracks(tracks);
    }
  }, [tracks]);

  const handleFiltersChange = useCallback(async (newFilters: FilterOptions, newSearchQuery: string, newSelectedCategory: string | null) => {
    setFilters(newFilters);
    setSearchQuery(newSearchQuery);
    setSelectedCategory(newSelectedCategory);
  }, []);

  const applyFilters = useCallback(async () => {
    try {
      if (!tracks) return;
      
      setIsFiltering(true);
      
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

      // Add a small delay to show skeleton loading
      await new Promise(resolve => setTimeout(resolve, 300));

      setFilteredTracks(filtered);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    } finally {
      setIsFiltering(false);
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
      
      // Also load demo tracks from localStorage if available
      const demoTracksData = localStorage.getItem('demo_tracks');
      if (demoTracksData) {
        try {
          const demoTracks = JSON.parse(demoTracksData);
          const combinedTracks = [...allTracks, ...demoTracks];
          setTracks(combinedTracks);
        } catch (e) {
          console.error('Failed to parse demo tracks:', e);
          setTracks(allTracks);
        }
      } else {
        setTracks(allTracks);
      }
      
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

  const handleTrackEdit = (track: Track) => {
    setEditingTrack(track);
  };

  const handleTrackSave = (updatedTrack: Track) => {
    setTracks(prev => prev.map(t => t.id === updatedTrack.id ? updatedTrack : t));
    setEditingTrack(null);
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




  const getFilteredTrackCount = () => {
    return filteredTracks?.length || 0;
  };

  const getTotalTrackCount = () => {
    return tracks?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="text-center">
          <div className="h-10 bg-stream-darker rounded-lg w-80 mx-auto mb-2 animate-pulse"></div>
          <div className="h-6 bg-stream-darker rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-4 bg-stream-darker rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-stream-darker rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-stream-gray rounded-xl p-6 border border-stream-light/20">
          <div className="space-y-4">
            <div className="h-12 bg-stream-darker rounded-lg animate-pulse"></div>
            <div className="h-8 bg-stream-darker rounded-lg w-32 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-stream-darker rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Tracks Grid Skeleton */}
        <SkeletonGrid 
          count={8} 
          columns={viewMode === 'grid' ? 4 : 1}
          variant={viewMode === 'grid' ? 'track' : 'compact'}
        />
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
            <button 
              onClick={() => setShowBulkUpload(true)}
              className="bg-stream-gray border border-stream-light/30 hover:bg-stream-light/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200"
            >
              📁 Bulk Upload
            </button>
            <button 
              onClick={() => setShowImportPlaylist(true)}
              className="bg-stream-gray border border-stream-light/30 hover:bg-stream-light/20 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200"
            >
              🎵 Import Playlist
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-stream-darker rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Recently Added:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              {tracks?.slice(0, 3).map(track => (
                <li key={track.id}>• {track.title} - {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')} - {track.energy === 5 ? 'High Energy' : track.energy <= 2 ? 'Low Energy' : 'Medium Energy'}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </RoleGuard>

      {/* Search and Filters */}
      <div className="space-y-6">
          {/* View Mode Toggle */}
        <div className="flex items-center justify-end space-x-2">
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

        {/* Enhanced Filters Bar */}
        <FiltersBar
          categories={categories}
          onFiltersChange={handleFiltersChange}
        />
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
        {isFiltering ? (
          <motion.div
            key="skeleton-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SkeletonGrid 
              count={8} 
              columns={viewMode === 'grid' ? 4 : 1}
              variant={viewMode === 'grid' ? 'track' : 'compact'}
            />
          </motion.div>
        ) : filteredTracks.length === 0 ? (
          <motion.div
            key="no-results"
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-white mb-2">No tracks found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setFilters({});
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="tracks-grid"
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.4,
              ease: "easeOut",
              staggerChildren: 0.05
            }}
          >
            {filteredTracks?.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              >
                <TrackCard
                track={track}
                onPlay={handlePlayTrack}
                onPause={() => setCurrentlyPlaying(null)}
                onEdit={handleTrackEdit}
                isPlaying={currentlyPlaying === track.id}
              />
              </motion.div>
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

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {showBulkUpload && (
          <BulkUploadModal
            onClose={() => setShowBulkUpload(false)}
            onUploadComplete={(tracks) => {
              setTracks(prev => [...tracks, ...prev]);
              setShowBulkUpload(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Import Playlist Modal */}
      <AnimatePresence>
        {showImportPlaylist && (
          <ImportPlaylistModal
            onClose={() => setShowImportPlaylist(false)}
            onImportComplete={(tracks) => {
              setTracks(prev => [...tracks, ...prev]);
              setShowImportPlaylist(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Track Edit Modal */}
      <AnimatePresence>
        {editingTrack && (
          <TrackEditModal
            track={editingTrack}
            onClose={() => setEditingTrack(null)}
            onSave={handleTrackSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedMusicLibrary;
