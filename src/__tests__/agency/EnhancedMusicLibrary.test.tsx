import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedMusicLibrary from '../../components/EnhancedMusicLibrary';
import { UserRole } from '../../types/agency';
import { Track } from '../../types/track';



// Mock data
const mockTracks: Track[] = [
  {
    id: 'track-1',
    title: 'Chill Gaming Track',
    artist: 'Chill Artist',
    duration: 180,
    audioUrl: '/tracks/chill.mp3',
    category: 'chill-gaming',
    subcategory: 'electronic',
    mood: 'chill',
    energy: 2,
    tags: ['chill', 'electronic', 'gaming'],
    streamSafe: true,
    loopFriendly: true,
    hasIntro: false,
    hasOutro: false,
    dmcaSafe: true,
    uploadDate: '2024-01-01',
    uploadedBy: 'agency-user',
    approved: true,
    featured: true
  },
  {
    id: 'track-2',
    title: 'Epic Stream Starting',
    artist: 'Epic Artist',
    duration: 240,
    audioUrl: '/tracks/epic.mp3',
    category: 'stream-starting',
    subcategory: 'orchestral',
    mood: 'epic',
    energy: 5,
    tags: ['epic', 'orchestral', 'streaming'],
    streamSafe: true,
    loopFriendly: false,
    hasIntro: true,
    hasOutro: true,
    dmcaSafe: true,
    uploadDate: '2024-01-02',
    uploadedBy: 'agency-user',
    approved: true,
    featured: false
  }
];

const mockCategories = [
  { id: 'chill-gaming', name: 'Chill Gaming', description: 'Background music for relaxed gameplay', color: '#4ecdc4', icon: '🎮', trackCount: 1 },
  { id: 'stream-starting', name: 'Stream Starting Soon', description: 'Professional intro music for stream openings', color: '#ff6b6b', icon: '🎬', trackCount: 1 }
];

const mockStreamerRole: UserRole = {
  type: 'streamer',
  permissions: ['manage_playlists'],
  userId: 'streamer-1',
  agencyId: 'agency-1'
};

const mockAgencyRole: UserRole = {
  type: 'agency',
  permissions: [
    'upload_tracks',
    'manage_users',
    'customize_branding',
    'view_analytics'
  ],
  userId: 'agency-user-1',
  agencyId: 'agency-1'
};

// Mock the entire module
jest.mock('../../services/trackManagementService', () => ({
  getAllTracks: jest.fn(),
  getTracksByCategory: jest.fn(),
  getFeaturedTracks: jest.fn(),
  searchTracks: jest.fn(),
  filterTracks: jest.fn(),
  getCategories: jest.fn(),
  getTotalTrackCount: jest.fn()
}));

describe('EnhancedMusicLibrary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const trackManagementService = require('../../services/trackManagementService');
    trackManagementService.getAllTracks.mockResolvedValue(mockTracks);
    trackManagementService.getTracksByCategory.mockResolvedValue(mockTracks);
    trackManagementService.getFeaturedTracks.mockResolvedValue(mockTracks);
    trackManagementService.searchTracks.mockResolvedValue(mockTracks);
    trackManagementService.filterTracks.mockResolvedValue(mockTracks);
    trackManagementService.getCategories.mockResolvedValue(mockCategories);
    trackManagementService.getTotalTrackCount.mockReturnValue(2);
  });

  describe('Role-Based Access Control', () => {
    test('should show admin controls for agency users', async () => {
      render(<EnhancedMusicLibrary userRole={mockAgencyRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('📁 Track Library Management')).toBeInTheDocument();
        expect(screen.getByText('+ Add New Track')).toBeInTheDocument();
        expect(screen.getByText('📁 Bulk Upload')).toBeInTheDocument();
        expect(screen.getByText('🎵 Import Playlist')).toBeInTheDocument();
      });
    });

    test('should not show admin controls for streamer users', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.queryByText('📁 Track Library Management')).not.toBeInTheDocument();
        expect(screen.queryByText('+ Add New Track')).not.toBeInTheDocument();
        expect(screen.queryByText('📁 Bulk Upload')).not.toBeInTheDocument();
        expect(screen.queryByText('🎵 Import Playlist')).not.toBeInTheDocument();
      });
    });

    test('should show track management section for agency users', async () => {
      render(<EnhancedMusicLibrary userRole={mockAgencyRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Recently Added:')).toBeInTheDocument();
        // Use getAllByText to handle multiple instances of the same track name
        expect(screen.getAllByText(/Chill Gaming Track/)).toHaveLength(2); // Once in list, once in grid
        expect(screen.getAllByText(/Epic Stream Starting/)).toHaveLength(2); // Once in list, once in grid
      });
    });

    test('should not show track management section for streamer users', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Recently Added:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Music Library Features', () => {
    test('should render search functionality for all users', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search tracks, artists, or tags...')).toBeInTheDocument();
      });
    });

    test('should render view mode toggle for all users', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('📱 Grid')).toBeInTheDocument();
        expect(screen.getByText('📋 List')).toBeInTheDocument();
      });
    });

    test('should render category filters for all users', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('All (2)')).toBeInTheDocument();
        // Category buttons are split into multiple elements; match by accessible name
        expect(screen.getByRole('button', { name: /Chill Gaming/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Stream Starting Soon/i })).toBeInTheDocument();
      });
    });

    test('should render advanced filters for all users', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByLabelText('Energy Level')).toBeInTheDocument();
        expect(screen.getByLabelText('Mood')).toBeInTheDocument();
        expect(screen.getByLabelText('Duration')).toBeInTheDocument();
        expect(screen.getByLabelText('Loop Friendly')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    test('should handle search input changes', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tracks, artists, or tags...');
        fireEvent.change(searchInput, { target: { value: 'chill' } });
        expect(searchInput).toHaveValue('chill');
      });
    });

    test('should handle category selection', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const chillGamingButton = screen.getByRole('button', { name: /Chill Gaming/i });
        fireEvent.click(chillGamingButton);
        expect(chillGamingButton).toHaveClass('bg-stream-accent');
      });
    });

    test('should handle energy level filtering', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const energySelect = screen.getByRole('combobox', { name: /energy level/i });
        fireEvent.change(energySelect, { target: { value: '1,2' } });
        expect(energySelect).toHaveValue('1,2');
      });
    });

    test('should handle mood filtering', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const moodSelect = screen.getByRole('combobox', { name: /mood/i });
        fireEvent.change(moodSelect, { target: { value: 'chill,peaceful' } });
        expect(moodSelect).toHaveValue('chill,peaceful');
      });
    });

    test('should handle duration filtering', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const durationSelect = screen.getByRole('combobox', { name: /duration/i });
        fireEvent.change(durationSelect, { target: { value: '60-180' } });
        expect(durationSelect).toHaveValue('60-180');
      });
    });

    test('should handle loop friendly filtering', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const loopSelect = screen.getByRole('combobox', { name: /loop friendly/i });
        fireEvent.change(loopSelect, { target: { value: 'true' } });
        expect(loopSelect).toHaveValue('true');
      });
    });
  });

  describe('Track Display', () => {
    test('should display tracks in grid view by default', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Chill Gaming Track')).toBeInTheDocument();
        expect(screen.getByText('Epic Stream Starting')).toBeInTheDocument();
        expect(screen.getByText('Chill Artist')).toBeInTheDocument();
        expect(screen.getByText('Epic Artist')).toBeInTheDocument();
      });
    });

    test('should switch to list view when toggled', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const listButton = screen.getByText('📋 List');
        fireEvent.click(listButton);
        expect(listButton).toHaveClass('bg-stream-accent');
      });
    });

    test('should display track metadata correctly', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Chill Gaming Track')).toBeInTheDocument();
        expect(screen.getByText('Chill Artist')).toBeInTheDocument();
        expect(screen.getByText('🎮')).toBeInTheDocument(); // Category icon
        expect(screen.getByText('chill')).toBeInTheDocument(); // Mood
        expect(screen.getByText('⭐⭐')).toBeInTheDocument(); // Energy level
      });
    });

    test('should show track duration in readable format', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('3:00')).toBeInTheDocument();
        expect(screen.getByText('4:00')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Management', () => {
    test('should show clear filters button when filters are active', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const energySelect = screen.getByRole('combobox', { name: /energy level/i });
        fireEvent.change(energySelect, { target: { value: '1,2' } });
        expect(screen.getByText('Clear all filters')).toBeInTheDocument();
      });
    });

    test('should clear all filters when clear button is clicked', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const energySelect = screen.getByRole('combobox', { name: /energy level/i });
        const moodSelect = screen.getByRole('combobox', { name: /mood/i });
        
        fireEvent.change(energySelect, { target: { value: '1,2' } });
        fireEvent.change(moodSelect, { target: { value: 'chill,peaceful' } });
        
        const clearButton = screen.getByText('Clear all filters');
        fireEvent.click(clearButton);
        
        expect(energySelect).toHaveValue('');
        expect(moodSelect).toHaveValue('');
      });
    });

    test('should show results summary', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 2 tracks')).toBeInTheDocument();
      });
    });
  });

  describe('No Results Handling', () => {
    test('should show no results message when no tracks match filters', async () => {
      // Mock empty results
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.filterTracks.mockResolvedValue([]);
      
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const energySelect = screen.getByRole('combobox', { name: /energy level/i });
        fireEvent.change(energySelect, { target: { value: '5' } });
        
        expect(screen.getByText('No tracks found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filters to find what you\'re looking for.')).toBeInTheDocument();
      });
    });

    test('should show clear filters button in no results state', async () => {
      // Mock empty results
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.filterTracks.mockResolvedValue([]);
      
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const energySelect = screen.getByRole('combobox', { name: /energy level/i });
        fireEvent.change(energySelect, { target: { value: '5' } });
        
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByLabelText('Energy Level')).toBeInTheDocument();
        expect(screen.getByLabelText('Mood')).toBeInTheDocument();
        expect(screen.getByLabelText('Duration')).toBeInTheDocument();
        expect(screen.getByLabelText('Loop Friendly')).toBeInTheDocument();
      });
    });

    test('should have proper button roles', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '📱 Grid' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '📋 List' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'All (2)' })).toBeInTheDocument();
      });
    });

    test('should have proper heading structure', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument();
      });
    });
  });

  describe('Service Integration', () => {
    test('should call service methods on component mount', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const trackManagementService = require('../../services/trackManagementService');
        expect(trackManagementService.getAllTracks).toHaveBeenCalled();
        expect(trackManagementService.getCategories).toHaveBeenCalled();
      });
    });

    test('should call search service when search query changes', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tracks, artists, or tags...');
        fireEvent.change(searchInput, { target: { value: 'chill' } });
        
        const trackManagementService = require('../../services/trackManagementService');
        expect(trackManagementService.searchTracks).toHaveBeenCalledWith('chill');
      });
    });

    test('should call filter service when filters change', async () => {
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        const energySelect = screen.getByRole('combobox', { name: /energy level/i });
        fireEvent.change(energySelect, { target: { value: '1,2' } });
        
        const trackManagementService = require('../../services/trackManagementService');
        expect(trackManagementService.filterTracks).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      // Mock service error
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks.mockRejectedValue(new Error('Service error'));
      
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByText('Loading music library...')).toBeInTheDocument();
      });
    });

    test('should handle missing data gracefully', async () => {
      // Mock empty data
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks.mockResolvedValue([]);
      trackManagementService.getCategories.mockResolvedValue([]);
      
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('No tracks found')).toBeInTheDocument();
      });
    });
  });
});

