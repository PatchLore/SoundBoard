import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Streamer } from '../types/agency';
import { Track } from '../types/track';
import trackManagementService from '../services/trackManagementService';
import unifiedAudioController from '../services/unifiedAudioController';
import PlaceholderAvatar from './PlaceholderAvatar';

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

  const loadStreamerData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all available tracks
      const allTracks = await trackManagementService.getAllTracks();
      console.log('🎵 Loaded tracks:', allTracks.length, 'tracks');
      setAvailableTracks(allTracks);
      
      // Load streamer's assigned tracks (from their favorite tracks)
      console.log('🎵 Streamer favorite tracks:', currentStreamer.soundboardConfig.favoriteTracks);
      const streamerTracksData = allTracks.filter(track => 
        currentStreamer.soundboardConfig.favoriteTracks.includes(track.id)
      );
      console.log('🎵 Streamer assigned tracks:', streamerTracksData.length, 'tracks');
      setStreamerTracks(streamerTracksData);
      
    } catch (error) {
      console.error('Error loading streamer data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentStreamer.soundboardConfig.favoriteTracks]);

  // Update currentStreamer when streamer prop changes
  useEffect(() => {
    setCurrentStreamer(streamer);
  }, [streamer]);

  useEffect(() => {
    loadStreamerData();
  }, [loadStreamerData]);

  const addTrackToStreamer = (track: Track) => {
    console.log('🎵 Adding track to streamer:', track.title, 'for streamer:', currentStreamer.name);
    console.log('🎵 Current favorite tracks:', currentStreamer.soundboardConfig.favoriteTracks);
    
    // Check if track is already assigned
    if (currentStreamer.soundboardConfig.favoriteTracks.includes(track.id)) {
      console.log('🎵 Track already assigned, skipping');
      return;
    }
    
    const updatedConfig = {
      ...currentStreamer.soundboardConfig,
      favoriteTracks: [...currentStreamer.soundboardConfig.favoriteTracks, track.id]
    };
    
    console.log('🎵 Updated config:', updatedConfig);
    
    // Update streamer in localStorage (in real app, this would be an API call)
    const demoStreamers = JSON.parse(localStorage.getItem('demo_streamers') || '[]');
    const updatedStreamers = demoStreamers.map((s: any) => 
      s.id === currentStreamer.id ? { ...s, soundboardConfig: updatedConfig } : s
    );
    localStorage.setItem('demo_streamers', JSON.stringify(updatedStreamers));
    
    // Notify parent component of the update
    const updatedStreamer = { ...currentStreamer, soundboardConfig: updatedConfig };
    onStreamerUpdate?.(updatedStreamer);
    
    // Update local state
    setCurrentStreamer(updatedStreamer);
    setStreamerTracks(prev => [...prev, track]);
    console.log('🎵 Track added successfully');
  };

  const removeTrackFromStreamer = (trackId: string) => {
    const updatedConfig = {
      ...streamer.soundboardConfig,
      favoriteTracks: streamer.soundboardConfig.favoriteTracks.filter(id => id !== trackId)
    };
    
    // Update streamer in localStorage
    const demoStreamers = JSON.parse(localStorage.getItem('demo_streamers') || '[]');
    const updatedStreamers = demoStreamers.map((s: any) => 
      s.id === streamer.id ? { ...s, soundboardConfig: updatedConfig } : s
    );
    localStorage.setItem('demo_streamers', JSON.stringify(updatedStreamers));
    
    // Notify parent component of the update
    const updatedStreamer = { ...streamer, soundboardConfig: updatedConfig };
    onStreamerUpdate?.(updatedStreamer);
    
    setStreamerTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const availableForStreamer = availableTracks.filter(track => 
    !currentStreamer.soundboardConfig.favoriteTracks.includes(track.id)
  );

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
                <p className="text-gray-400 text-sm mb-4">
                  This shows how {currentStreamer.name} will see their soundboard. 
                  Use the Track Management tab to assign tracks to this streamer.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {streamerTracks.length > 0 ? (
                    streamerTracks.map((track) => (
                      <div key={track.id} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{track.title}</h4>
                            <p className="text-gray-400 text-sm">{track.artist}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                                {track.category}
                              </span>
                              <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                                {track.mood}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handlePlayTrack(track)}
                            className={`ml-3 p-2 rounded-lg transition-colors ${
                              playingTrackId === track.id
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
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
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-400">No tracks assigned to this streamer yet</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Use the Track Management tab to add tracks
                      </p>
                    </div>
                  )}
                </div>
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
                          <h4 className="text-white font-medium">{track.title}</h4>
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
                          <h4 className="text-white font-medium">{track.title}</h4>
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
