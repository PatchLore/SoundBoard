import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agency, Streamer } from '../types/agency';
import StreamerProfile from './StreamerProfile';
import BulkOperations from './BulkOperations';
import AnalyticsDashboard from './AnalyticsDashboard';
import BrandingCustomization from './BrandingCustomization';
import PlaceholderAvatar from './PlaceholderAvatar';
import ClientManagement from './ClientManagement';
import AddStreamerForm from './AddStreamerForm';
import StreamerSoundboardManager from './StreamerSoundboardManager';
import StreamerStatsModal from './StreamerStatsModal';
import StreamerAssignedCollections from './StreamerAssignedCollections';
import authService, { FeatureFlags } from '../services/authService';
import usageStatsService, { AgencyUsageStats } from '../services/usageStatsService';

const AgencyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'streamers' | 'analytics' | 'branding' | 'bulk' | 'clients'>('overview');
  const [agency, setAgency] = useState<Agency | null>(null);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);
  const [showStreamerProfile, setShowStreamerProfile] = useState(false);
  const [showAddStreamerModal, setShowAddStreamerModal] = useState(false);
  const [showSoundboardManager, setShowSoundboardManager] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStreamerForStats, setSelectedStreamerForStats] = useState<Streamer | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [streamerFilter, setStreamerFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showBackButton, setShowBackButton] = useState(false);
  const [agencyStats, setAgencyStats] = useState<AgencyUsageStats | null>(null);

  // Load feature flags
  useEffect(() => {
    const flags = authService.getFeatureFlags();
    setFeatureFlags(flags);
    console.log('🔒 AgencyDashboard feature flags:', flags);
  }, []);

  // Load usage statistics
  useEffect(() => {
    const stats = usageStatsService.getAgencyStats();
    setAgencyStats(stats);
  }, [streamers]);

  // Get assigned collections count for a streamer
  const getAssignedCollectionsCount = (streamerId: string): number => {
    try {
      const assignmentsData = localStorage.getItem('music_collection_assignments');
      const assignments = assignmentsData ? JSON.parse(assignmentsData) : {};
      if (!assignments || typeof assignments !== 'object') return 0;
      let count = 0;
      Object.values(assignments).forEach((streamerIds: any) => {
        if (Array.isArray(streamerIds) && streamerIds.includes(streamerId)) {
          count++;
        }
      });
      return count;
    } catch {
      return 0;
    }
  };

  // Navigation handlers
  const handleTotalStreamersClick = () => {
    setActiveTab('streamers');
    setStreamerFilter('all');
    setShowBackButton(true);
  };

  const handleActiveStreamersClick = () => {
    setActiveTab('streamers');
    setStreamerFilter('active');
    setShowBackButton(true);
  };

  const handleBackToOverview = () => {
    setActiveTab('overview');
    setStreamerFilter('all');
    setShowBackButton(false);
  };

  // Function to add a new streamer
  const handleAddStreamer = (streamerData: { name: string; email: string }) => {
    const newStreamer: Streamer = {
      id: `streamer_${Date.now()}`,
      name: streamerData.name,
      email: streamerData.email,
      agencyId: agency?.id || 'agency_001',
      avatar: undefined,
      isActive: true,
      soundboardConfig: {
        favoriteTracks: [],
        customCategories: [],
        volumeDefaults: 75,
        autoplaySettings: false,
        defaultMood: 'energetic',
        defaultGenre: 'electronic',
        defaultEnergyLevel: 'high',
        theme: 'dark'
      },
      usageStats: {
        totalPlayTime: 0,
        tracksPlayed: 0,
        lastActive: new Date().toISOString(),
        favoriteMoods: [],
        favoriteGenres: [],
        peakUsageHours: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update local state
    setStreamers(prev => [...prev, newStreamer]);
    
    // Save to localStorage for persistence
    const demoStreamers = JSON.parse(localStorage.getItem('demo_streamers') || '[]');
    demoStreamers.push(newStreamer);
    localStorage.setItem('demo_streamers', JSON.stringify(demoStreamers));
    
    setShowAddStreamerModal(false);
  };

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

    // Load demo streamers from localStorage if available
    const demoStreamersData = localStorage.getItem('demo_streamers');
    let mockStreamers: Streamer[] = [];
    
    if (demoStreamersData) {
      try {
        const demoStreamers = JSON.parse(demoStreamersData);
        // Use the saved streamers directly if they have all required fields
        mockStreamers = demoStreamers.map((demo: any) => ({
          id: demo.id,
          name: demo.name,
          email: demo.email,
          agencyId: demo.agencyId || 'agency_001',
          avatar: demo.avatar,
          isActive: demo.isActive !== undefined ? demo.isActive : true,
          soundboardConfig: demo.soundboardConfig || {
            favoriteTracks: [],
            customCategories: [],
            volumeDefaults: 75,
            autoplaySettings: false,
            defaultMood: 'energetic',
            defaultGenre: 'electronic',
            defaultEnergyLevel: 'high',
            theme: 'dark'
          },
          usageStats: demo.usageStats || {
            totalPlayTime: 0,
            tracksPlayed: 0,
            lastActive: new Date().toISOString(),
            favoriteMoods: [],
            favoriteGenres: [],
            peakUsageHours: []
          },
          createdAt: demo.createdAt || new Date().toISOString(),
          updatedAt: demo.updatedAt || new Date().toISOString()
        }));
      } catch (e) {
        console.error('Failed to parse demo streamers:', e);
      }
    }

    // Add default mock streamers if no demo data
    if (mockStreamers.length === 0) {
      mockStreamers = [
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
  }

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

  const handleManageSoundboard = (streamer: Streamer) => {
    setSelectedStreamer(streamer);
    setShowSoundboardManager(true);
  };

  const handleViewStats = (streamer: Streamer) => {
    setSelectedStreamerForStats(streamer);
    setShowStatsModal(true);
  };

  const handleStreamerSave = (updatedStreamer: Streamer) => {
    // Update local state
    setStreamers(prev => prev.map(s => s.id === updatedStreamer.id ? updatedStreamer : s));
    
    // Save to localStorage for persistence
    const demoStreamers = JSON.parse(localStorage.getItem('demo_streamers') || '[]');
    const updatedDemoStreamers = demoStreamers.map((s: any) => 
      s.id === updatedStreamer.id ? updatedStreamer : s
    );
    localStorage.setItem('demo_streamers', JSON.stringify(updatedDemoStreamers));
    
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
              {showBackButton && (
                <button
                  onClick={handleBackToOverview}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Overview</span>
                </button>
              )}
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                VS
              </div>
              <h1 className="text-2xl font-bold text-white">{agency?.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Active Streamers: {streamers.filter(s => s.isActive).length}</span>
              <button 
                onClick={() => setShowAddStreamerModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
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
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-white">Agency Overview</h2>
                  <button
                    onClick={() => {
                      // Restore demo data
                      const demoStreamers = [
                        { 
                          id: 'streamer_1', 
                          name: 'Alex "NightRider" Chen', 
                          email: 'alex.chen@example.com',
                          agencyId: 'agency_001',
                          isActive: true,
                          soundboardConfig: {
                            favoriteTracks: [],
                            customCategories: [],
                            volumeDefaults: 75,
                            autoplaySettings: false,
                            defaultMood: 'energetic',
                            defaultGenre: 'electronic',
                            defaultEnergyLevel: 'high',
                            theme: 'dark'
                          },
                          usageStats: {
                            totalPlayTime: 0,
                            tracksPlayed: 0,
                            lastActive: new Date().toISOString(),
                            favoriteMoods: [],
                            favoriteGenres: [],
                            peakUsageHours: []
                          },
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        }
                      ];
                      localStorage.setItem('demo_streamers', JSON.stringify(demoStreamers));
                      window.location.reload();
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    title="Restore Demo Data"
                  >
                    🔄 Restore Demo Data
                  </button>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <button 
                    onClick={handleTotalStreamersClick}
                    className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors text-left group"
                  >
                    <h3 className="text-lg font-medium text-gray-300 group-hover:text-white">Total Streamers</h3>
                    <p className="text-3xl font-bold text-white group-hover:text-blue-400">{streamers.length}</p>
                    {featureFlags && featureFlags.maxClients > 0 && featureFlags.maxClients !== -1 && (
                      <p className="text-xs text-gray-400 mt-1">Max: {featureFlags.maxClients}</p>
                    )}
                  </button>
                  <button 
                    onClick={handleActiveStreamersClick}
                    className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors text-left group"
                  >
                    <h3 className="text-lg font-medium text-gray-300 group-hover:text-white">Active Streamers</h3>
                    <p className="text-3xl font-bold text-green-400 group-hover:text-green-300">{streamers.filter(s => s.isActive).length}</p>
                  </button>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300">Total Play Time</h3>
                    <p className="text-3xl font-bold text-blue-400">
                      {agencyStats ? Math.round(agencyStats.totalPlayTime / 3600) : 0}h
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {agencyStats ? Math.round(agencyStats.totalPlayTime / 60) % 60 : 0}m
                    </p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300">Tracks Played</h3>
                    <p className="text-3xl font-bold text-purple-400">
                      {agencyStats ? agencyStats.totalTracks : 0}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last active: {agencyStats ? new Date(agencyStats.lastActive).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Performance Grid */}
                {agencyStats && (
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Performance Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-300 mb-2">Favorite Moods</h4>
                        <div className="flex flex-wrap gap-2">
                          {agencyStats.favoriteMoods.slice(0, 5).map((mood, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                              {mood}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-300 mb-2">Favorite Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {agencyStats.favoriteGenres.slice(0, 5).map((genre, index) => (
                            <span key={index} className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-300 mb-2">Peak Usage Hours</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(agencyStats.peakUsageHours)).slice(0, 5).map((hour, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                              {hour}:00
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                
                {/* Filter Section */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300">Filter:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setStreamerFilter('all')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          streamerFilter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        All ({streamers.length})
                      </button>
                      <button
                        onClick={() => setStreamerFilter('active')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          streamerFilter === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Active ({streamers.filter(s => s.isActive).length})
                      </button>
                      <button
                        onClick={() => setStreamerFilter('inactive')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          streamerFilter === 'inactive'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Inactive ({streamers.filter(s => !s.isActive).length})
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {streamers.filter(streamer => {
                    if (streamerFilter === 'active') return streamer.isActive;
                    if (streamerFilter === 'inactive') return !streamer.isActive;
                    return true;
                  }).map((streamer) => (
                    <div key={streamer.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <div className="flex items-start space-x-4 mb-6">
                        <PlaceholderAvatar name={streamer.name} size="lg" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-white">{streamer.name}</h3>
                              <p className="text-gray-400">{streamer.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getAssignedCollectionsCount(streamer.id) > 0 && (
                                <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full font-medium">
                                  {getAssignedCollectionsCount(streamer.id)} collection{getAssignedCollectionsCount(streamer.id) !== 1 ? 's' : ''}
                                </span>
                              )}
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                streamer.isActive 
                                  ? 'bg-green-900 text-green-300' 
                                  : 'bg-red-900 text-red-300'
                              }`}>
                                {streamer.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-400 text-sm">Total Play Time</p>
                              <p className="text-white">
                                {(() => {
                                  const stats = usageStatsService.getStreamerStats(streamer.id);
                                  return stats ? Math.round(stats.totalPlayTime / 3600) : 0;
                                })()}h
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Tracks Played</p>
                              <p className="text-white">
                                {(() => {
                                  const stats = usageStatsService.getStreamerStats(streamer.id);
                                  return stats ? stats.trackCount : 0;
                                })()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Last Active</p>
                              <p className="text-white">
                                {(() => {
                                  const stats = usageStatsService.getStreamerStats(streamer.id);
                                  return stats ? new Date(stats.lastActive).toLocaleDateString() : 'Never';
                                })()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Favorite Mood</p>
                              <p className="text-white">{streamer.soundboardConfig.defaultMood}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleStreamerEdit(streamer)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleManageSoundboard(streamer)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              Manage Soundboard
                            </button>
                            <button 
                              onClick={() => handleViewStats(streamer)}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                              View Stats
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Assigned Collections Panel */}
                      <StreamerAssignedCollections 
                        streamer={streamer}
                        onCollectionUnassign={(collectionId) => {
                          // Refresh the assigned collections when a collection is unassigned
                          console.log(`Collection ${collectionId} unassigned from ${streamer.name}`);
                        }}
                      />
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

      {/* Add Streamer Modal */}
      <AnimatePresence>
        {showAddStreamerModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Streamer</h2>
                <button
                  onClick={() => setShowAddStreamerModal(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <AddStreamerForm onSubmit={handleAddStreamer} onCancel={() => setShowAddStreamerModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streamer Soundboard Manager Modal */}
      <AnimatePresence>
        {showSoundboardManager && selectedStreamer && (
          <StreamerSoundboardManager
            streamer={selectedStreamer}
            onClose={() => {
              setShowSoundboardManager(false);
              setSelectedStreamer(null);
            }}
            onStreamerUpdate={(updatedStreamer) => {
              setStreamers(prev => prev.map(s => s.id === updatedStreamer.id ? updatedStreamer : s));
            }}
          />
        )}
      </AnimatePresence>

      {/* Streamer Stats Modal */}
      <AnimatePresence>
        {showStatsModal && selectedStreamerForStats && (
          <StreamerStatsModal
            streamer={selectedStreamerForStats}
            onClose={() => {
              setShowStatsModal(false);
              setSelectedStreamerForStats(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgencyDashboard;
