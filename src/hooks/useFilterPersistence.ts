import { useState, useEffect, useCallback } from 'react';
import { FilterOptions } from '../types/track';

const STORAGE_KEY = 'soundSwoop.filters';

interface FilterState {
  filters: FilterOptions;
  searchQuery: string;
  selectedCategory: string | null;
}

const defaultFilterState: FilterState = {
  filters: {},
  searchQuery: '',
  selectedCategory: null,
};

export const useFilterPersistence = () => {
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFilterState(parsed);
      }
    } catch (error) {
      console.warn('Failed to load saved filters:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Debounced save to localStorage
  const saveToStorage = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newState: FilterState) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          } catch (error) {
            console.warn('Failed to save filters:', error);
          }
        }, 400);
      };
    })(),
    []
  );

  // Update filters with persistence
  const updateFilters = useCallback((updates: Partial<FilterOptions>) => {
    setFilterState(prev => {
      const newState = {
        ...prev,
        filters: { ...prev.filters, ...updates }
      };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  // Update search query with persistence
  const updateSearchQuery = useCallback((query: string) => {
    setFilterState(prev => {
      const newState = { ...prev, searchQuery: query };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  // Update selected category with persistence
  const updateSelectedCategory = useCallback((category: string | null) => {
    setFilterState(prev => {
      const newState = { ...prev, selectedCategory: category };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setFilterState(defaultFilterState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear saved filters:', error);
    }
  }, []);

  // Remove a specific filter
  const removeFilter = useCallback((filterKey: keyof FilterOptions) => {
    setFilterState(prev => {
      const newFilters = { ...prev.filters };
      delete newFilters[filterKey];
      const newState = { ...prev, filters: newFilters };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return (
      Object.keys(filterState.filters).length > 0 ||
      filterState.searchQuery.trim() !== '' ||
      filterState.selectedCategory !== null
    );
  }, [filterState]);

  // Get active filter chips data
  const getActiveFilterChips = useCallback(() => {
    const chips: Array<{ label: string; value: string; filterKey: keyof FilterOptions }> = [];

    // Energy filter
    if (filterState.filters.energy && filterState.filters.energy.length > 0) {
      const energyLabels = filterState.filters.energy.map(e => {
        if (e <= 2) return 'Low';
        if (e <= 3) return 'Medium';
        return 'High';
      });
      chips.push({
        label: 'Energy',
        value: energyLabels.join(', '),
        filterKey: 'energy'
      });
    }

    // Mood filter
    if (filterState.filters.mood && filterState.filters.mood.length > 0) {
      chips.push({
        label: 'Mood',
        value: filterState.filters.mood.join(', '),
        filterKey: 'mood'
      });
    }

    // Duration filter
    if (filterState.filters.duration) {
      const { min, max } = filterState.filters.duration;
      chips.push({
        label: 'Duration',
        value: `${Math.floor(min / 60)}:${(min % 60).toString().padStart(2, '0')} - ${Math.floor(max / 60)}:${(max % 60).toString().padStart(2, '0')}`,
        filterKey: 'duration'
      });
    }

    // BPM filter
    if (filterState.filters.bpm) {
      chips.push({
        label: 'BPM',
        value: `${filterState.filters.bpm.min} - ${filterState.filters.bpm.max}`,
        filterKey: 'bpm'
      });
    }

    // Loop friendly filter
    if (filterState.filters.loopFriendly !== undefined) {
      chips.push({
        label: 'Loop',
        value: filterState.filters.loopFriendly ? 'Friendly' : 'Not Friendly',
        filterKey: 'loopFriendly'
      });
    }

    // Featured filter
    if (filterState.filters.featured !== undefined) {
      chips.push({
        label: 'Featured',
        value: filterState.filters.featured ? 'Yes' : 'No',
        filterKey: 'featured'
      });
    }

    return chips;
  }, [filterState.filters]);

  return {
    filterState,
    isLoaded,
    updateFilters,
    updateSearchQuery,
    updateSelectedCategory,
    resetAllFilters,
    removeFilter,
    hasActiveFilters: hasActiveFilters(),
    getActiveFilterChips,
  };
};
