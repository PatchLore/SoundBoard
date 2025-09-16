import React from 'react';
import { motion } from 'framer-motion';
import { Streamer } from '../types/agency';
import PlaceholderAvatar from './PlaceholderAvatar';

interface StreamerStatsModalProps {
  streamer: Streamer;
  onClose: () => void;
}

const StreamerStatsModal: React.FC<StreamerStatsModalProps> = ({
  streamer,
  onClose
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PlaceholderAvatar name={streamer.name} size="lg" />
              <div>
                <h2 className="text-2xl font-bold text-white">{streamer.name} - Statistics</h2>
                <p className="text-gray-400">{streamer.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    streamer.isActive 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {streamer.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Member since {formatDate(streamer.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Statistics */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">📊 Usage Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Play Time</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {formatDuration(streamer.usageStats.totalPlayTime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tracks Played</span>
                  <span className="text-2xl font-bold text-green-400">
                    {streamer.usageStats.tracksPlayed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Active</span>
                  <span className="text-lg text-white">
                    {formatDate(streamer.usageStats.lastActive)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Session</span>
                  <span className="text-lg text-purple-400">
                    {streamer.usageStats.tracksPlayed > 0 
                      ? formatDuration(streamer.usageStats.totalPlayTime / streamer.usageStats.tracksPlayed)
                      : '0h 0m'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Soundboard Configuration */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">⚙️ Soundboard Configuration</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Default Volume</span>
                  <span className="text-lg text-white">{streamer.soundboardConfig.volumeDefaults}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Default Mood</span>
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-sm">
                    {streamer.soundboardConfig.defaultMood}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Default Genre</span>
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                    {streamer.soundboardConfig.defaultGenre}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Theme</span>
                  <span className="px-2 py-1 bg-gray-600/20 text-gray-300 rounded text-sm">
                    {streamer.soundboardConfig.theme}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Autoplay</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    streamer.soundboardConfig.autoplaySettings 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {streamer.soundboardConfig.autoplaySettings ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Favorite Tracks */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">🎵 Favorite Tracks</h3>
              <div className="space-y-2">
                {streamer.soundboardConfig.favoriteTracks.length > 0 ? (
                  <div className="text-sm text-gray-400">
                    {streamer.soundboardConfig.favoriteTracks.length} tracks assigned
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No favorite tracks assigned yet</div>
                )}
              </div>
            </div>

            {/* Custom Categories */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">🏷️ Custom Categories</h3>
              <div className="space-y-2">
                {streamer.soundboardConfig.customCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {streamer.soundboardConfig.customCategories.map((category, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No custom categories created</div>
                )}
              </div>
            </div>

            {/* Peak Usage Hours */}
            <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
              <h3 className="text-xl font-semibold text-white mb-4">⏰ Peak Usage Hours</h3>
              <div className="space-y-2">
                {streamer.usageStats.peakUsageHours.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {streamer.usageStats.peakUsageHours.map((hour, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded text-sm"
                      >
                        {hour}:00
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No peak usage data available</div>
                )}
              </div>
            </div>

            {/* Favorite Moods & Genres */}
            <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
              <h3 className="text-xl font-semibold text-white mb-4">🎨 Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-3">Favorite Moods</h4>
                  <div className="flex flex-wrap gap-2">
                    {streamer.usageStats.favoriteMoods.length > 0 ? (
                      streamer.usageStats.favoriteMoods.map((mood, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-sm"
                        >
                          {mood}
                        </span>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No mood preferences recorded</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-3">Favorite Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {streamer.usageStats.favoriteGenres.length > 0 ? (
                      streamer.usageStats.favoriteGenres.map((genre, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No genre preferences recorded</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StreamerStatsModal;







