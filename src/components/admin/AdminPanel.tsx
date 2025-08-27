import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../../types/track';
import trackManagementService from '../../services/trackManagementService';
import TrackUploader from './TrackUploader';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'settings'>('upload');
  const [showUploader, setShowUploader] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setIsLoading(true);
      const allTracks = await trackManagementService.getAllTracks();
      setTracks(allTracks);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle track upload from the TrackUploader component
  const handleTrackUpload = async (newTrack: Track) => {
    try {
      // Add the new track to the local state
      setTracks(prev => [newTrack, ...prev]);
      
      // Close the uploader
      setShowUploader(false);
      
      console.log('Track uploaded successfully:', newTrack.title);
    } catch (error) {
      console.error('Failed to handle track upload:', error);
    }
  };

  const getStats = () => {
    if (!tracks) {
      return { total: 0, approved: 0, pending: 0, categories: 0 };
    }
    const total = tracks.length;
    const approved = tracks.filter(t => t.approved).length;
    const pending = tracks.filter(t => !t.approved).length;
    const categories = new Set(tracks.map(t => t.category)).size;
    
    return { total, approved, pending, categories };
  };

  const stats = getStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'upload', label: 'Upload Tracks', icon: '📤' },
            { id: 'manage', label: 'Manage Tracks', icon: '🎵' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Track Management
              </h3>
              <p className="text-gray-400 mb-6">
                Upload and manage your streaming music library
              </p>
              <button
                onClick={() => setShowUploader(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Upload New Track
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-gray-400 text-sm">Total Tracks</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                <div className="text-gray-400 text-sm">Approved</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                <div className="text-gray-400 text-sm">Pending</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.categories}</div>
                <div className="text-gray-400 text-sm">Categories</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Track Management</h3>
              <button
                onClick={() => setShowUploader(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                + Add Track
              </button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading tracks...</p>
              </div>
            ) : !tracks || tracks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-lg font-semibold text-white mb-2">No tracks yet</h3>
                <p className="text-gray-400 mb-4">Upload your first track to get started</p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Upload First Track
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tracks.map(track => (
                  <div key={track.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{track.title}</h4>
                      <p className="text-gray-400 text-sm">{track.artist}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">{track.category}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                        {!track.approved && (
                          <>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-yellow-400">Pending Approval</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors">
                        ✏️
                      </button>
                      <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Admin Settings
            </h3>
            <p className="text-gray-400">
              Coming soon: Configure admin preferences and permissions
            </p>
          </div>
        )}

        {/* Track Uploader Modal */}
        {showUploader && (
          <TrackUploader
            onTrackUpload={handleTrackUpload}
            onClose={() => setShowUploader(false)}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;



