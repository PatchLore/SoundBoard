import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterOptions } from '../../types/track';
import { useFilterPersistence } from '../../hooks/useFilterPersistence';
import ResetAllButton from './ResetAllButton';
import ActiveFilterChip from './ActiveFilterChip';

interface FiltersBarProps {
  categories: Array<{ id: string; name: string; trackCount: number }>;
  onFiltersChange: (filters: FilterOptions, searchQuery: string, selectedCategory: string | null) => void;
  className?: string;
}

const FiltersBar: React.FC<FiltersBarProps> = ({ 
  categories, 
  onFiltersChange, 
  className = '' 
}) => {
  const {
    filterState,
    isLoaded,
    updateFilters,
    updateSearchQuery,
    updateSelectedCategory,
    resetAllFilters,
    removeFilter,
    hasActiveFilters,
    getActiveFilterChips,
  } = useFilterPersistence();

  // Notify parent component when filters change
  React.useEffect(() => {
    if (isLoaded) {
      onFiltersChange(filterState.filters, filterState.searchQuery, filterState.selectedCategory);
    }
  }, [filterState, isLoaded, onFiltersChange]);

  const handleResetAll = () => {
    resetAllFilters();
  };

  const handleRemoveFilter = (filterKey: keyof FilterOptions) => {
    removeFilter(filterKey);
  };

  const activeFilterChips = getActiveFilterChips();

  if (!isLoaded) {
    return (
      <div className={`bg-stream-gray rounded-xl p-6 border border-stream-light/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-stream-darker rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-stream-darker rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-stream-darker rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-stream-gray rounded-xl p-6 border border-stream-light/20 ${className}`}>
      {/* Search and Reset Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search-input" className="sr-only">Search tracks</label>
          <input
            id="search-input"
            type="text"
            placeholder="Search tracks, artists, or tags..."
            value={filterState.searchQuery}
            onChange={(e) => updateSearchQuery(e.target.value)}
            className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
          />
        </div>

        {/* Reset All Button */}
        <div className="flex items-center">
          <ResetAllButton 
            onReset={handleResetAll}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {activeFilterChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <h3 className="text-sm font-medium text-gray-300 mb-3">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {activeFilterChips.map((chip, index) => (
                <ActiveFilterChip
                  key={`${chip.filterKey}-${index}`}
                  label={chip.label}
                  value={chip.value}
                  onRemove={() => handleRemoveFilter(chip.filterKey)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => updateSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filterState.selectedCategory === null
                ? 'bg-stream-accent text-white'
                : 'bg-stream-darker text-gray-400 hover:text-white border border-stream-light/20'
            }`}
          >
            All ({categories.reduce((sum, cat) => sum + cat.trackCount, 0)})
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => updateSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filterState.selectedCategory === category.id
                  ? 'bg-stream-accent text-white'
                  : 'bg-stream-darker text-gray-400 hover:text-white border border-stream-light/20'
              }`}
            >
              {category.name} ({category.trackCount})
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Energy Level */}
        <div>
          <label htmlFor="energy-level" className="block text-sm font-medium text-gray-300 mb-2">
            Energy Level
          </label>
          <select
            id="energy-level"
            aria-label="Energy Level"
            value={filterState.filters.energy?.join(',') || ''}
            onChange={(e) => {
              const values = e.target.value ? e.target.value.split(',').map(v => parseInt(v)) : undefined;
              updateFilters({ energy: values });
            }}
            className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
          >
            <option value="">All Levels</option>
            <option value="1,2">Low (1-2)</option>
            <option value="3">Medium (3)</option>
            <option value="4,5">High (4-5)</option>
          </select>
        </div>

        {/* Mood */}
        <div>
          <label htmlFor="mood-select" className="block text-sm font-medium text-gray-300 mb-2">
            Mood
          </label>
          <select
            id="mood-select"
            aria-label="Mood"
            value={filterState.filters.mood?.join(',') || ''}
            onChange={(e) => {
              const values = e.target.value ? e.target.value.split(',') : undefined;
              updateFilters({ mood: values });
            }}
            className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
          >
            <option value="">All Moods</option>
            <option value="chill,peaceful">Chill & Peaceful</option>
            <option value="epic,energetic">Epic & Energetic</option>
            <option value="mysterious,dark">Mysterious & Dark</option>
            <option value="uplifting">Uplifting</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration-select" className="block text-sm font-medium text-gray-300 mb-2">
            Duration
          </label>
          <select
            id="duration-select"
            aria-label="Duration"
            value={filterState.filters.duration ? `${filterState.filters.duration.min}-${filterState.filters.duration.max}` : ''}
            onChange={(e) => {
              if (e.target.value) {
                const [min, max] = e.target.value.split('-').map(v => parseInt(v));
                updateFilters({ duration: { min, max } });
              } else {
                updateFilters({ duration: undefined });
              }
            }}
            className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
          >
            <option value="">Any Duration</option>
            <option value="0-60">Under 1 min</option>
            <option value="60-180">1-3 min</option>
            <option value="180-300">3-5 min</option>
            <option value="300-600">5-10 min</option>
          </select>
        </div>

        {/* Loop Friendly */}
        <div>
          <label htmlFor="loop-friendly" className="block text-sm font-medium text-gray-300 mb-2">
            Loop Friendly
          </label>
          <select
            id="loop-friendly"
            aria-label="Loop Friendly"
            value={filterState.filters.loopFriendly?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : e.target.value === 'true';
              updateFilters({ loopFriendly: value });
            }}
            className="w-full bg-stream-darker border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
          >
            <option value="">Any</option>
            <option value="true">Loop Friendly</option>
            <option value="false">Not Loop Friendly</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
