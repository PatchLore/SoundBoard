import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../types/track';
import { Client, TrackCollection } from '../services/trackStorageService';
import trackStorageService from '../services/trackStorageService';
import trackManagementService from '../services/trackManagementService';

interface CollectionTrackManagerProps {
  client: Client;
  collection: TrackCollection;
  onClose: () => void;
  onCollectionUpdate?: () => void;
}

const CollectionTrackManager: React.FC<CollectionTrackManagerProps> = ({
  client,
  collection,
  onClose,
  onCollectionUpdate
}) => {
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [collectionTracks, setCollectionTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadTracks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all available tracks
      const allTracks = await trackManagementService.getAllTracks();
      setAvailableTracks(allTracks);
      
      // Load tracks already in this collection (filter by track IDs in collection)
      const collectionTracksData = allTracks.filter(track => 
        collection.tracks.includes(track.id)
      );
      setCollectionTracks(collectionTracksData);
      
    } catch (error) {
      console.error('Error loading tracks:', error);
    } finally {
      setLoading(false);
    }
  }, [collection.tracks]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const addTrackToCollection = (track: Track) => {
    try {
      const success = trackStorageService.addTrackToCollection(collection.id, track.id);
      if (success) {
        setCollectionTracks(prev => [...prev, track]);
        console.log(`✅ Track "${track.title}" added to collection "${collection.name}"`);
        // Notify parent component to refresh data
        if (onCollectionUpdate) {
          onCollectionUpdate();
        }
      } else {
        console.error('Failed to add track to collection');
      }
    } catch (error) {
      console.error('Error adding track to collection:', error);
    }
  };

  const removeTrackFromCollection = (trackId: string) => {
    try {
      const success = trackStorageService.removeTrackFromCollection(collection.id, trackId);
      if (success) {
        setCollectionTracks(prev => prev.filter(t => t.id !== trackId));
        console.log(`✅ Track removed from collection "${collection.name}"`);
        // Notify parent component to refresh data
        if (onCollectionUpdate) {
          onCollectionUpdate();
        }
      } else {
        console.error('Failed to remove track from collection');
      }
    } catch (error) {
      console.error('Error removing track from collection:', error);
    }
  };

  const filteredAvailableTracks = availableTracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || track.category === selectedCategory;
    const notInCollection = !collectionTracks.some(ct => ct.id === track.id);
    
    return matchesSearch && matchesCategory && notInCollection;
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tracks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Manage Tracks: {collection.name}
              </h2>
              <p className="text-gray-400 mt-1">
                Client: {client.name} • {collectionTracks.length} tracks in collection
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Available Tracks */}
          <div className="w-1/2 p-6 border-r border-gray-700">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">Available Tracks</h3>
              
              {/* Search and Filter */}
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="chill-gaming">Chill Gaming</option>
                  <option value="gaming-action">Gaming Action</option>
                  <option value="boss-battle">Boss Battle</option>
                  <option value="creative-flow">Creative Flow</option>
                </select>
              </div>
            </div>

            {/* Track List */}
            <div className="space-y-2 max-h-[calc(100%-120px)] overflow-y-auto">
              {filteredAvailableTracks.map((track) => (
                <motion.div
                  key={track.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-white font-medium">{track.title}</h4>
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                        Client Track
                      </span>
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
                  <button
                    onClick={() => addTrackToCollection(track)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Add
                  </button>
                </motion.div>
              ))}
              
              {filteredAvailableTracks.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No tracks available to add
                </p>
              )}
            </div>
          </div>

          {/* Collection Tracks */}
          <div className="w-1/2 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Collection Tracks ({collectionTracks.length})
            </h3>
            
            <div className="space-y-2 max-h-[calc(100%-60px)] overflow-y-auto">
              {collectionTracks.map((track) => (
                <motion.div
                  key={track.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-white font-medium">{track.title}</h4>
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                        Client Track
                      </span>
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
                  <button
                    onClick={() => removeTrackFromCollection(track.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
              
              {collectionTracks.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No tracks in this collection yet
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CollectionTrackManager;
