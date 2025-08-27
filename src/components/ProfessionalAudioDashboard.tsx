import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioController } from '../services/audioController';
import EnhancedAudioControls from './EnhancedAudioControls';
import EnhancedTrackCard from './EnhancedTrackCard';
// Removed YouTube Audio Library integration — migrated to Suno API
import { getStreamingCategories, getCategoryDisplayName } from '../data/categories';
import { StreamingTrack, getEnergyLevel } from '../types/track';

const ProfessionalAudioDashboard: React.FC = () => {
  const [tracks, setTracks] = useState<StreamingTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<StreamingTrack[]>([]);
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEnergy, setSelectedEnergy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tracks' | 'controls' | 'analytics'>('tracks');
  const [loading, setLoading] = useState(true);

  // Removed YouTube Audio Library integration — migrated to Suno API
  // Load sample tracks for now (will be replaced with Suno API tracks)
  React.useEffect(() => {
    const loadTracks = async () => {
      try {
        // For now, use sample tracks until Suno API integration is complete
        const sampleTracks: StreamingTrack[] = [
          {
            id: 'sample_1',
                    title: 'Professional Chill Track',
        artist: 'Professional sample track for testing',
            duration: 150,
            audioUrl: 'https://api.sunoapi.org/sample1.mp3',
            category: 'chill-gaming',
            subcategory: 'chill',
            mood: 'chill',
            energy: 2,
            tags: ['ambient', 'chill', 'chill_gaming', 'low'],
            streamSafe: true,
            loopFriendly: true,
            hasIntro: false,
            hasOutro: false,
            uploadDate: new Date().toISOString(),
            uploadedBy: 'system',
            approved: true,
            featured: false,
            // Legacy fields for backward compatibility
            streamingCategory: 'chill_gaming',
            energyLevel: 'low',
            genre: 'ambient',
            dmcaSafe: true,
            vodSafe: true,
            license: 'royalty_free',
            licenseDetails: 'Professional sample track',
            platformCompliance: {
              twitch: 'safe',
              youtube: 'safe',
              facebook: 'safe',
              tiktok: 'safe'
            },
            usageTracking: {
              usageCount: 0,
              lastUsed: undefined
            },
            agencyNotes: 'Professional sample track'
          }
        ];
        setTracks(sampleTracks);
        setFilteredTracks(sampleTracks);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tracks:', error);
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  // Filter tracks based on search and filters
  React.useEffect(() => {
    let filtered = tracks;

    if (selectedMood !== 'all') {
      filtered = filtered.filter(track => track.mood === selectedMood);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(track => track.streamingCategory === selectedCategory);
    }

    if (selectedEnergy !== 'all') {
      filtered = filtered.filter(track => getEnergyLevel(track) === selectedEnergy);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist?.toLowerCase().includes(query) ||
        track.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTracks(filtered);
  }, [tracks, selectedMood, selectedCategory, selectedEnergy, searchQuery]);

  const moods = ['all', 'chill', 'epic', 'energetic', 'mysterious', 'uplifting', 'dark', 'peaceful'];
  const categories = ['all', ...getStreamingCategories()];
  const energyLevels = ['all', 'low', 'medium', 'high'];

  const formatCategoryName = (category: string) => {
    if (category === 'all') return 'All Categories';
    return getCategoryDisplayName(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Professional Audio Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <motion.header 
        className="bg-gray-800 border-b border-gray-700 shadow-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                VS
              </div>
              <h1 className="text-2xl font-bold text-white">Professional Audio Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''} available
              </span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                audioController.getIsPlaying() 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {audioController.getIsPlaying() ? 'Playing' : 'Stopped'}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <motion.nav 
        className="bg-gray-800 border-b border-gray-700"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'tracks', label: 'Track Library', icon: '🎵' },
              { id: 'controls', label: 'Audio Controls', icon: '🎛️' },
              { id: 'analytics', label: 'Audio Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'tracks' && (
            <motion.div
              key="tracks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search and Filters */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search tracks, tags, descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Mood Filter */}
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {moods.map(mood => (
                      <option key={mood} value={mood} className="bg-gray-800 text-white">
                        {mood === 'all' ? 'All Moods' : mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-gray-800 text-white">
                        {category === 'all' ? 'All Categories' : formatCategoryName(category)}
                      </option>
                    ))}
                  </select>

                  {/* Energy Level Filter */}
                  <select
                    value={selectedEnergy}
                    onChange={(e) => setSelectedEnergy(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {energyLevels.map(energy => (
                      <option key={energy} value={energy} className="bg-gray-800 text-white">
                        {energy === 'all' ? 'All Energy Levels' : energy.charAt(0).toUpperCase() + energy.slice(1)}
                      </option>
                    ))}
                  </select>

                  {/* Results Count */}
                  <div className="flex items-center justify-center px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl">
                    <span className="text-white">
                      {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracks Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTracks.map((track) => (
                  <EnhancedTrackCard
                    key={track.id}
                    track={track}
                    onPlay={() => console.log('Track started:', track.title)}
                  />
                ))}
              </div>

              {filteredTracks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No tracks found matching your criteria.</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'controls' && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedAudioControls />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Audio Analytics</h2>
                
                {/* Audio Processing Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Audio Ducking</h3>
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        audioController.getSettings().duckingEnabled ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-white">
                        {audioController.getSettings().duckingEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Threshold: {audioController.getSettings().duckingThreshold} dB
                    </p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Normalization</h3>
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        audioController.getSettings().normalizationEnabled ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-white">
                        {audioController.getSettings().normalizationEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Compressor: {audioController.getSettings().normalizationEnabled ? '24dB' : 'Off'}
                    </p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Current Volume</h3>
                    <p className="text-3xl font-bold text-blue-400">
                      {Math.round(audioController.getVolume() * 100)}%
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Master Level
                    </p>
                  </div>
                </div>

                {/* Audio Quality Metrics */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Audio Quality Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Fade Controls</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Fade In Duration</span>
                          <span className="text-white">{audioController.getSettings().fadeInDuration}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Fade Out Duration</span>
                          <span className="text-white">{audioController.getSettings().fadeOutDuration}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Crossfade Duration</span>
                          <span className="text-white">{audioController.getSettings().crossfadeDuration}s</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Loop Settings</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Looping Enabled</span>
                          <span className="text-white">
                            {audioController.getSettings().loopEnabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Loop Count</span>
                          <span className="text-white">
                            {audioController.getSettings().loopCount === -1 ? 'Infinite' : audioController.getSettings().loopCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProfessionalAudioDashboard;
