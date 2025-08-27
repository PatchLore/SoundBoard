import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Streamer, SoundboardConfig } from '../types/agency';
import PlaceholderAvatar from './PlaceholderAvatar';

interface StreamerProfileProps {
  streamer: Streamer;
  onSave: (updatedStreamer: Streamer) => void;
  onClose: () => void;
}

const StreamerProfile: React.FC<StreamerProfileProps> = ({ streamer, onSave, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStreamer, setEditedStreamer] = useState<Streamer>(streamer);

  const handleSave = () => {
    onSave(editedStreamer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStreamer(streamer);
    setIsEditing(false);
  };

  const updateConfig = (updates: Partial<SoundboardConfig>) => {
    setEditedStreamer(prev => ({
      ...prev,
      soundboardConfig: {
        ...prev.soundboardConfig,
        ...updates
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <PlaceholderAvatar name={editedStreamer.name} size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-white">{editedStreamer.name}</h2>
              <p className="text-gray-400">{editedStreamer.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Soundboard Configuration */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              Soundboard Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Volume
                </label>
                {isEditing ? (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editedStreamer.soundboardConfig.volumeDefaults}
                    onChange={(e) => updateConfig({ volumeDefaults: Number(e.target.value) })}
                    className="w-full"
                  />
                ) : (
                  <p className="text-white">{editedStreamer.soundboardConfig.volumeDefaults}%</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Mood
                </label>
                {isEditing ? (
                  <select
                    value={editedStreamer.soundboardConfig.defaultMood}
                    onChange={(e) => updateConfig({ defaultMood: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="chill">Chill</option>
                    <option value="epic">Epic</option>
                    <option value="energetic">Energetic</option>
                    <option value="mysterious">Mysterious</option>
                    <option value="peaceful">Peaceful</option>
                  </select>
                ) : (
                  <p className="text-white capitalize">{editedStreamer.soundboardConfig.defaultMood}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Genre
                </label>
                {isEditing ? (
                  <select
                    value={editedStreamer.soundboardConfig.defaultGenre}
                    onChange={(e) => updateConfig({ defaultGenre: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="ambient">Ambient</option>
                    <option value="electronic">Electronic</option>
                    <option value="orchestral">Orchestral</option>
                    <option value="acoustic">Acoustic</option>
                    <option value="lo-fi">Lo-Fi</option>
                  </select>
                ) : (
                  <p className="text-white capitalize">{editedStreamer.soundboardConfig.defaultGenre}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={editedStreamer.soundboardConfig.autoplaySettings}
                  onChange={(e) => updateConfig({ autoplaySettings: e.target.checked })}
                  disabled={!isEditing}
                  className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoplay" className="text-sm font-medium text-gray-300">
                  Enable Autoplay
                </label>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              Usage Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-2">Playback Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Play Time</p>
                    <p className="text-white font-semibold">
                      {Math.round(editedStreamer.usageStats.totalPlayTime / 3600)}h {Math.round((editedStreamer.usageStats.totalPlayTime % 3600) / 60)}m
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tracks Played</p>
                    <p className="text-white font-semibold">{editedStreamer.usageStats.tracksPlayed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-2">Preferences</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-sm">Favorite Moods</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {editedStreamer.usageStats.favoriteMoods.map((mood, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                          {mood}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Favorite Genres</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {editedStreamer.usageStats.favoriteGenres.map((genre, index) => (
                        <span key={index} className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-2">Activity</h4>
                <p className="text-gray-400 text-sm">Last Active</p>
                <p className="text-white">
                  {new Date(editedStreamer.usageStats.lastActive).toLocaleDateString()} at{' '}
                  {new Date(editedStreamer.usageStats.lastActive).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StreamerProfile;
