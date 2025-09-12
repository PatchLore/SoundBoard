import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FiltersBar } from '../components/FiltersBar';
import { useFilterPersistence } from '../hooks/useFilterPersistence';

// Mock the useFilterPersistence hook
jest.mock('../hooks/useFilterPersistence');

const mockUseFilterPersistence = useFilterPersistence as jest.MockedFunction<typeof useFilterPersistence>;

const mockCategories = [
  { id: 'chill-gaming', name: 'Chill Gaming', trackCount: 5 },
  { id: 'gaming-action', name: 'Gaming Action', trackCount: 8 },
  { id: 'hype-raid', name: 'Hype Raid', trackCount: 3 },
];

const defaultMockReturn = {
  filterState: {
    filters: {},
    searchQuery: '',
    selectedCategory: null,
  },
  isLoaded: true,
  updateFilters: jest.fn(),
  updateSearchQuery: jest.fn(),
  updateSelectedCategory: jest.fn(),
  resetAllFilters: jest.fn(),
  removeFilter: jest.fn(),
  hasActiveFilters: false,
  getActiveFilterChips: jest.fn(() => []),
};

describe('FiltersBar', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFilterPersistence.mockReturnValue(defaultMockReturn);
  });

  it('renders loading state correctly', () => {
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      isLoaded: false,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('Search tracks, artists, or tags...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset all/i })).toBeDisabled();
  });

  it('renders with no active filters', () => {
    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByRole('button', { name: /reset all/i })).toBeDisabled();
    expect(screen.getByText('All (16)')).toBeInTheDocument(); // Total count from categories
  });

  it('renders with active filters and shows chips', () => {
    const activeChips = [
      { label: 'Energy', value: 'High', filterKey: 'energy' as const },
      { label: 'Mood', value: 'epic, energetic', filterKey: 'mood' as const },
    ];

    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      hasActiveFilters: true,
      getActiveFilterChips: jest.fn(() => activeChips),
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByRole('button', { name: /reset all/i })).not.toBeDisabled();
    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.getByText('Energy: High')).toBeInTheDocument();
    expect(screen.getByText('Mood: epic, energetic')).toBeInTheDocument();
  });

  it('calls resetAllFilters when reset button is clicked', () => {
    const mockResetAllFilters = jest.fn();
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      hasActiveFilters: true,
      resetAllFilters: mockResetAllFilters,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset all/i });
    fireEvent.click(resetButton);

    expect(mockResetAllFilters).toHaveBeenCalledTimes(1);
  });

  it('updates search query when input changes', () => {
    const mockUpdateSearchQuery = jest.fn();
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      updateSearchQuery: mockUpdateSearchQuery,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search tracks, artists, or tags...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(mockUpdateSearchQuery).toHaveBeenCalledWith('test query');
  });

  it('updates selected category when category button is clicked', () => {
    const mockUpdateSelectedCategory = jest.fn();
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      updateSelectedCategory: mockUpdateSelectedCategory,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const categoryButton = screen.getByText('Chill Gaming (5)');
    fireEvent.click(categoryButton);

    expect(mockUpdateSelectedCategory).toHaveBeenCalledWith('chill-gaming');
  });

  it('updates filters when energy level changes', () => {
    const mockUpdateFilters = jest.fn();
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      updateFilters: mockUpdateFilters,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const energySelect = screen.getByLabelText('Energy Level');
    fireEvent.change(energySelect, { target: { value: '4,5' } });

    expect(mockUpdateFilters).toHaveBeenCalledWith({ energy: [4, 5] });
  });

  it('updates filters when mood changes', () => {
    const mockUpdateFilters = jest.fn();
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      updateFilters: mockUpdateFilters,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const moodSelect = screen.getByLabelText('Mood');
    fireEvent.change(moodSelect, { target: { value: 'chill,peaceful' } });

    expect(mockUpdateFilters).toHaveBeenCalledWith({ mood: ['chill', 'peaceful'] });
  });

  it('updates filters when duration changes', () => {
    const mockUpdateFilters = jest.fn();
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      updateFilters: mockUpdateFilters,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const durationSelect = screen.getByLabelText('Duration');
    fireEvent.change(durationSelect, { target: { value: '60-180' } });

    expect(mockUpdateFilters).toHaveBeenCalledWith({ duration: { min: 60, max: 180 } });
  });

  it('updates filters when loop friendly changes', () => {
    const mockUpdateFilters = jest.fn();
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      updateFilters: mockUpdateFilters,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const loopSelect = screen.getByLabelText('Loop Friendly');
    fireEvent.change(loopSelect, { target: { value: 'true' } });

    expect(mockUpdateFilters).toHaveBeenCalledWith({ loopFriendly: true });
  });

  it('removes filter when chip remove button is clicked', () => {
    const mockRemoveFilter = jest.fn();
    const activeChips = [
      { label: 'Energy', value: 'High', filterKey: 'energy' as const },
    ];

    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      hasActiveFilters: true,
      getActiveFilterChips: jest.fn(() => activeChips),
      removeFilter: mockRemoveFilter,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const removeButton = screen.getByLabelText('Remove Energy filter');
    fireEvent.click(removeButton);

    expect(mockRemoveFilter).toHaveBeenCalledWith('energy');
  });

  it('calls onFiltersChange when filters change', async () => {
    const mockUpdateFilters = jest.fn();
    mockUseFilterPersistence.mockReturnValue({
      ...defaultMockReturn,
      updateFilters: mockUpdateFilters,
    });

    render(
      <FiltersBar
        categories={mockCategories}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Trigger a filter change
    const energySelect = screen.getByLabelText('Energy Level');
    fireEvent.change(energySelect, { target: { value: '1,2' } });

    // Wait for the effect to call onFiltersChange
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });
  });
});
