import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FilterOptions } from '../../types/track';
import { FiltersBar } from '../../components/FiltersBar';

const FiltersDemo: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterHistory, setFilterHistory] = useState<Array<{
    timestamp: Date;
    filters: FilterOptions;
    searchQuery: string;
    selectedCategory: string | null;
  }>>([]);

  const mockCategories = [
    { id: 'chill-gaming', name: 'Chill Gaming', trackCount: 15 },
    { id: 'gaming-action', name: 'Gaming Action', trackCount: 23 },
    { id: 'hype-raid', name: 'Hype Raid', trackCount: 8 },
    { id: 'break-brb', name: 'Break/BRB', trackCount: 12 },
    { id: 'talk-show', name: 'Talk Show', trackCount: 18 },
    { id: 'intro-outro', name: 'Intro/Outro', trackCount: 6 },
    { id: 'boss-battle', name: 'Boss Battle', trackCount: 9 },
    { id: 'intermission', name: 'Intermission', trackCount: 7 },
    { id: 'background-chat', name: 'Background Chat', trackCount: 14 },
  ];

  const handleFiltersChange = useCallback((
    newFilters: FilterOptions, 
    newSearchQuery: string, 
    newSelectedCategory: string | null
  ) => {
    setFilters(newFilters);
    setSearchQuery(newSearchQuery);
    setSelectedCategory(newSelectedCategory);

    // Add to history
    setFilterHistory(prev => [
      {
        timestamp: new Date(),
        filters: newFilters,
        searchQuery: newSearchQuery,
        selectedCategory: newSelectedCategory,
      },
      ...prev.slice(0, 9) // Keep last 10 entries
    ]);
  }, []);

  const clearHistory = () => {
    setFilterHistory([]);
  };

  const formatFilters = (filters: FilterOptions) => {
    const parts: string[] = [];
    
    if (filters.energy?.length) {
      parts.push(`Energy: ${filters.energy.join(', ')}`);
    }
    if (filters.mood?.length) {
      parts.push(`Mood: ${filters.mood.join(', ')}`);
    }
    if (filters.duration) {
      parts.push(`Duration: ${filters.duration.min}-${filters.duration.max}s`);
    }
    if (filters.bpm) {
      parts.push(`BPM: ${filters.bpm.min}-${filters.bpm.max}`);
    }
    if (filters.loopFriendly !== undefined) {
      parts.push(`Loop Friendly: ${filters.loopFriendly ? 'Yes' : 'No'}`);
    }
    if (filters.featured !== undefined) {
      parts.push(`Featured: ${filters.featured ? 'Yes' : 'No'}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'None';
  };

  return (
    <div className="min-h-screen bg-stream-dark p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🎛️ Filters Demo
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Test the enhanced filter system with persistence and active chips
          </p>
        </motion.div>

        {/* Current State Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stream-gray rounded-xl p-6 border border-stream-light/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Current Filter State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Search Query</h3>
              <p className="text-white font-mono bg-stream-darker p-3 rounded">
                {searchQuery || '(empty)'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Selected Category</h3>
              <p className="text-white font-mono bg-stream-darker p-3 rounded">
                {selectedCategory || '(none)'}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Advanced Filters</h3>
              <p className="text-white font-mono bg-stream-darker p-3 rounded">
                {formatFilters(filters)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FiltersBar
            categories={mockCategories}
            onFiltersChange={handleFiltersChange}
          />
        </motion.div>

        {/* Filter History */}
        {filterHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stream-gray rounded-xl p-6 border border-stream-light/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-white">Filter History</h2>
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filterHistory.map((entry, index) => (
                <div
                  key={index}
                  className="bg-stream-darker p-4 rounded-lg border border-stream-light/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-400">Search:</span> {entry.searchQuery || '(empty)'}</p>
                    <p><span className="text-gray-400">Category:</span> {entry.selectedCategory || '(none)'}</p>
                    <p><span className="text-gray-400">Filters:</span> {formatFilters(entry.filters)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Features Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-stream-gray rounded-xl p-6 border border-stream-light/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Features Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-stream-darker p-4 rounded-lg">
              <h3 className="text-lg font-medium text-stream-accent mb-2">🔄 Reset All</h3>
              <p className="text-gray-400 text-sm">
                Click "Reset All" to clear all filters and search query at once
              </p>
            </div>
            <div className="bg-stream-darker p-4 rounded-lg">
              <h3 className="text-lg font-medium text-stream-accent mb-2">💾 Persistence</h3>
              <p className="text-gray-400 text-sm">
                Filters are automatically saved to localStorage and restored on page reload
              </p>
            </div>
            <div className="bg-stream-darker p-4 rounded-lg">
              <h3 className="text-lg font-medium text-stream-accent mb-2">🏷️ Active Chips</h3>
              <p className="text-gray-400 text-sm">
                Active filters appear as removable chips above the filter controls
              </p>
            </div>
            <div className="bg-stream-darker p-4 rounded-lg">
              <h3 className="text-lg font-medium text-stream-accent mb-2">⚡ Debounced</h3>
              <p className="text-gray-400 text-sm">
                Filter changes are debounced (400ms) to prevent excessive localStorage writes
              </p>
            </div>
            <div className="bg-stream-darker p-4 rounded-lg">
              <h3 className="text-lg font-medium text-stream-accent mb-2">🎯 Individual Remove</h3>
              <p className="text-gray-400 text-sm">
                Click the × on any active filter chip to remove just that filter
              </p>
            </div>
            <div className="bg-stream-darker p-4 rounded-lg">
              <h3 className="text-lg font-medium text-stream-accent mb-2">📱 Responsive</h3>
              <p className="text-gray-400 text-sm">
                Filter layout adapts to different screen sizes with proper spacing
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-blue-400 mb-3">How to Test</h2>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Try different search queries and watch the state update</li>
            <li>Select different categories and see them reflected in the state</li>
            <li>Use the advanced filters (Energy, Mood, Duration, Loop Friendly)</li>
            <li>Notice how active filters appear as chips above the controls</li>
            <li>Click the × on chips to remove individual filters</li>
            <li>Click "Reset All" to clear everything at once</li>
            <li>Refresh the page to see filters persist from localStorage</li>
            <li>Check the browser's localStorage for the "soundSwoop.filters" key</li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
};

export default FiltersDemo;
