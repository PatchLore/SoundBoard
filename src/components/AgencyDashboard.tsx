import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agency, Streamer } from '../types/agency';
import StreamerProfile from './StreamerProfile';
import BulkOperations from './BulkOperations';
import AnalyticsDashboard from './AnalyticsDashboard';
import BrandingCustomization from './BrandingCustomization';
import PlaceholderAvatar from './PlaceholderAvatar';
import ClientManagement from './ClientManagement';
import authService, { FeatureFlags } from '../services/authService';

const AgencyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'streamers' | 'analytics' | 'branding' | 'bulk' | 'clients'>('overview');
  const [agency, setAgency] = useState<Agency | null>(null);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);
  const [showStreamerProfile, setShowStreamerProfile] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);

  // Load feature flags
  useEffect(() => {
    const flags = authService.getFeatureFlags();
    setFeatureFlags(flags);
    console.log('🔒 AgencyDashboard feature flags:', flags);
  }, []);

  // Mock data for development
  useEffect(() => {
    const mockAgency: Agency = {
      id: 'agency_001',
      name: 'Vivid Soundscapes Agency',
      description: 'Professional music agency for streamers',
      logo: '/logo.png',
      primaryColor: '#1f2937',
      secondaryColor: '#374151',
      accentColor: '#3b82f6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscriptionPlan: 'professional',
      maxUsers: 10,
      features: ['upload_tracks', 'manage_users', 'analytics']
    };

    const mockStreamers: Streamer[] = [
      {
        id: 'streamer_001',
        name: 'Alex Gaming',
        email: 'alex@vividsoundscapes.com',
        agencyId: 'agency_001',
        avatar: '/avatars/alex.jpg',
        isActive: true,
        soundboardConfig: {
          favoriteTracks: ['yt_001', 'yt_003'],
          customCategories: ['gaming_intro', 'victory_music'],
          volumeDefaults: 75,
          autoplaySettings: false,
          defaultMood: 'energetic',
          defaultGenre: 'electronic',
          defaultEnergyLevel: 'high',
          theme: 'dark'
        },
        usageStats: {
          totalPlayTime: 7200,
          tracksPlayed: 45,
          lastActive: new Date().toISOString(),
          favoriteMoods: ['energetic', 'epic'],
          favoriteGenres: ['electronic', 'orchestral'],
          peakUsageHours: [20, 21, 22]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'streamer_002',
        name: 'Sarah Creative',
        email: 'sarah@vividsoundscapes.com',
        agencyId: 'agency_001',
        avatar: '/avatars/sarah.jpg',
        isActive: true,
        soundboardConfig: {
          favoriteTracks: ['yt_002', 'yt_005'],
          customCategories: ['creative_flow', 'inspiration'],
          volumeDefaults: 60,
          autoplaySettings: true,
          defaultMood: 'chill',
          defaultGenre: 'ambient',
          defaultEnergyLevel: 'low',
          theme: 'light'
        },
        usageStats: {
          totalPlayTime: 5400,
          tracksPlayed: 32,
          lastActive: new Date().toISOString(),
          favoriteMoods: ['chill', 'peaceful'],
          favoriteGenres: ['ambient', 'acoustic'],
          peakUsageHours: [14, 15, 16]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Apply plan-based client limits
    let limitedStreamers = mockStreamers;
    if (featureFlags && featureFlags.maxClients > 0 && featureFlags.maxClients !== -1) {
      limitedStreamers = mockStreamers.slice(0, featureFlags.maxClients);
      console.log(`🔒 Agency plan limit applied: showing ${limitedStreamers.length} of ${featureFlags.maxClients} max clients`);
    }

    setAgency(mockAgency);
    setStreamers(limitedStreamers);
    setLoading(false);
  }, [featureFlags]);

  const handleStreamerEdit = (streamer: Streamer) => {
    setSelectedStreamer(streamer);
    setShowStreamerProfile(true);
  };

  const handleStreamerSave = (updatedStreamer: Streamer) => {
    setStreamers(prev => prev.map(s => s.id === updatedStreamer.id ? updatedStreamer : s));
    setShowStreamerProfile(false);
    setSelectedStreamer(null);
  };

  const handleStreamerClose = () => {
    setShowStreamerProfile(false);
    setSelectedStreamer(null);
  };

  const handleBulkOperation = async (operation: any) => {
    // Simulate bulk operation execution
    console.log('Executing bulk operation:', operation);
    
    // Update streamers based on operation type
    const updatedStreamers = streamers.map(streamer => {
      if (operation.targetStreamers.includes(streamer.id)) {
        const updatedConfig = { ...streamer.soundboardConfig };
        
        switch (operation.operationType) {
          case 'volume_change':
            updatedConfig.volumeDefaults = operation.parameters.volume;
            break;
          case 'theme_change':
            updatedConfig.theme = operation.parameters.theme;
            break;
          case 'category_update':
            // Add custom category logic here
            break;
          case 'track_add':
            if (operation.parameters.addToFavorites) {
              updatedConfig.favoriteTracks = [
                ...updatedConfig.favoriteTracks,
                operation.parameters.trackId
              ];
            }
            break;
        }
        
        return {
          ...streamer,
          soundboardConfig: updatedConfig,
          updatedAt: new Date().toISOString()
        };
      }
      return streamer;
    });
    
    setStreamers(updatedStreamers);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Agency Dashboard...</p>
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
              <h1 className="text-2xl font-bold text-white">{agency?.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Active Streamers: {streamers.filter(s => s.isActive).length}</span>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Add Streamer
              </button>
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
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'streamers', label: 'Streamers', icon: '👥' },
              { id: 'clients', label: 'Clients', icon: '🏢' },
              ...(featureFlags?.canUseAnalytics ? [{ id: 'analytics', label: 'Analytics', icon: '📈' }] : []),
              ...(featureFlags?.canUseBranding ? [{ id: 'branding', label: 'Branding', icon: '🎨' }] : []),
              ...(featureFlags?.canUseBulkOperations ? [{ id: 'bulk', label: 'Bulk Operations', icon: '⚡' }] : []),
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
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Agency Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300">Total Streamers</h3>
                    <p className="text-3xl font-bold text-white">{streamers.length}</p>
                    {featureFlags && featureFlags.maxClients > 0 && featureFlags.maxClients !== -1 && (
                      <p className="text-xs text-gray-400 mt-1">Max: {featureFlags.maxClients}</p>
                    )}
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300">Active Streamers</h3>
                    <p className="text-3xl font-bold text-green-400">{streamers.filter(s => s.isActive).length}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300">Total Play Time</h3>
                    <p className="text-3xl font-bold text-blue-400">
                      {Math.round(streamers.reduce((acc, s) => acc + s.usageStats.totalPlayTime, 0) / 3600)}h
                    </p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300">Tracks Played</h3>
                    <p className="text-3xl font-bold text-purple-400">
                      {streamers.reduce((acc, s) => acc + s.usageStats.tracksPlayed, 0)}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {streamers.slice(0, 3).map((streamer) => (
                      <div key={streamer.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                                                  <PlaceholderAvatar name={streamer.name} size="sm" />
                          <span className="text-white font-medium">{streamer.name}</span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          Last active: {new Date(streamer.usageStats.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'streamers' && (
            <motion.div
              key="streamers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Streamer Management</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {streamers.map((streamer) => (
                    <div key={streamer.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-4 mb-4">
                                              <PlaceholderAvatar name={streamer.name} size="lg" />
                        <div>
                          <h3 className="text-xl font-semibold text-white">{streamer.name}</h3>
                          <p className="text-gray-400">{streamer.email}</p>
                        </div>
                        <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                          streamer.isActive 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {streamer.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Favorite Mood</p>
                          <p className="text-white">{streamer.soundboardConfig.defaultMood}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Play Time</p>
                          <p className="text-white">{Math.round(streamer.usageStats.totalPlayTime / 3600)}h</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleStreamerEdit(streamer)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                          View Stats
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ClientManagement />
            </motion.div>
          )}

          {activeTab === 'analytics' && featureFlags?.canUseAnalytics && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}

          {activeTab === 'branding' && featureFlags?.canUseBranding && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BrandingCustomization 
                agency={agency!}
                onSave={(branding) => {
                  console.log('Saving branding:', branding);
                  // Here you would typically save to your backend
                }}
              />
            </motion.div>
          )}

          {activeTab === 'bulk' && featureFlags?.canUseBulkOperations && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BulkOperations 
                streamers={streamers}
                onExecute={handleBulkOperation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Streamer Profile Modal */}
      <AnimatePresence>
        {showStreamerProfile && selectedStreamer && (
          <StreamerProfile
            streamer={selectedStreamer}
            onSave={handleStreamerSave}
            onClose={handleStreamerClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgencyDashboard;
