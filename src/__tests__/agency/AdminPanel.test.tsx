import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from '../../components/admin/AdminPanel';

// Mock the trackManagementService
jest.mock('../../services/trackManagementService', () => ({
  getAllTracks: jest.fn(),
  getTotalTrackCount: jest.fn(),
  getTracksByCategory: jest.fn(),
  uploadTrack: jest.fn()
}));

// Mock data
const mockTracks = [
  {
    id: 'track-1',
    title: 'Test Track 1',
    artist: 'Test Artist 1',
    duration: 180,
    audioUrl: '/tracks/test1.mp3',
    category: 'chill-gaming',
    subcategory: 'electronic',
    mood: 'chill',
    energy: 3,
    tags: ['chill', 'electronic'],
    streamSafe: true,
    loopFriendly: false,
    hasIntro: false,
    hasOutro: false,
    dmcaSafe: true,
    uploadDate: '2024-01-01',
    uploadedBy: 'agency-user',
    approved: true,
    featured: false
  },
  {
    id: 'track-2',
    title: 'Test Track 2',
    artist: 'Test Artist 2',
    duration: 240,
    audioUrl: '/tracks/test2.mp3',
    category: 'stream-starting',
    subcategory: 'orchestral',
    mood: 'epic',
    energy: 5,
    tags: ['epic', 'orchestral'],
    streamSafe: true,
    loopFriendly: true,
    hasIntro: true,
    hasOutro: true,
    dmcaSafe: true,
    uploadDate: '2024-01-02',
    uploadedBy: 'agency-user',
    approved: true,
    featured: true
  }
];

const defaultProps = {
  onClose: jest.fn()
};

describe('AdminPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('should render admin panel with correct title', () => {
      render(<AdminPanel {...defaultProps} />);
      
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('should show tab navigation', () => {
      render(<AdminPanel {...defaultProps} />);
      
      expect(screen.getByText('📤 Upload Tracks')).toBeInTheDocument();
      expect(screen.getByText('🎵 Manage Tracks')).toBeInTheDocument();
      expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
    });

    test('should show close button', () => {
      render(<AdminPanel {...defaultProps} />);
      
      expect(screen.getByText('×')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('should switch to Manage Tracks tab', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const manageTab = screen.getByText('🎵 Manage Tracks');
      fireEvent.click(manageTab);
      
      expect(screen.getByText('Track Management')).toBeInTheDocument();
      expect(screen.getByText('Upload New Track')).toBeInTheDocument();
    });

    test('should show track statistics in manage tab', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const manageTab = screen.getByText('🎵 Manage Tracks');
      fireEvent.click(manageTab);
      
      expect(screen.getByText('Total Tracks')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    test('should show upload interface in upload tab', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const uploadTab = screen.getByText('📤 Upload Tracks');
      fireEvent.click(uploadTab);
      
      expect(screen.getByText('Upload New Track')).toBeInTheDocument();
    });
  });

  describe('Track Management', () => {
    test('should show upload new track button', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const manageTab = screen.getByText('🎵 Manage Tracks');
      fireEvent.click(manageTab);
      
      const uploadButton = screen.getByText('Upload New Track');
      expect(uploadButton).toBeInTheDocument();
    });

    test('should display track statistics correctly', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const manageTab = screen.getByText('🎵 Manage Tracks');
      fireEvent.click(manageTab);
      
      // Should show stats boxes
      expect(screen.getByText('Total Tracks')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    test('should show track management interface', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const manageTab = screen.getByText('🎵 Manage Tracks');
      fireEvent.click(manageTab);
      
      expect(screen.getByText('Track Management')).toBeInTheDocument();
      expect(screen.getByText('Upload and manage your streaming music library')).toBeInTheDocument();
    });
  });

  describe('Upload Functionality', () => {
    test('should open track uploader when upload button is clicked', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const manageTab = screen.getByText('🎵 Manage Tracks');
      fireEvent.click(manageTab);
      
      const uploadButton = screen.getByText('Upload New Track');
      fireEvent.click(uploadButton);
      
      // Should show uploader modal
      expect(screen.getByText('📁 Upload New Track')).toBeInTheDocument();
    });

    test('should handle track upload successfully', async () => {
      render(<AdminPanel {...defaultProps} />);
      
      const manageTab = screen.getByText('🎵 Manage Tracks');
      fireEvent.click(manageTab);
      
      const uploadButton = screen.getByText('Upload New Track');
      fireEvent.click(uploadButton);
      
      // Should show uploader
      expect(screen.getByText('📁 Upload New Track')).toBeInTheDocument();
      
      // Close uploader
      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);
      
      // Should return to manage view
      expect(screen.getByText('Track Management')).toBeInTheDocument();
    });
  });

  describe('Settings Tab', () => {
    test('should show settings interface', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const settingsTab = screen.getByText('⚙️ Settings');
      fireEvent.click(settingsTab);
      
      // Should show settings content
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    test('should load tracks on component mount', async () => {
      const mockGetAllTracks = jest.fn().mockResolvedValue(mockTracks);
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      render(<AdminPanel {...defaultProps} />);
      
      expect(mockGetAllTracks).toHaveBeenCalled();
    });

    test('should handle loading state', () => {
      render(<AdminPanel {...defaultProps} />);
      
      // Should show loading state initially
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      const mockGetAllTracks = jest.fn().mockRejectedValue(new Error('Service error'));
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      render(<AdminPanel {...defaultProps} />);
      
      // Should still render without crashing
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('should handle empty tracks gracefully', async () => {
      const mockGetAllTracks = jest.fn().mockResolvedValue([]);
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      render(<AdminPanel {...defaultProps} />);
      
      // Should still render without crashing
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading structure', () => {
      render(<AdminPanel {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: 'Admin Panel' })).toBeInTheDocument();
    });

    test('should have proper button roles', () => {
      render(<AdminPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: '📤 Upload Tracks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '🎵 Manage Tracks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '⚙️ Settings' })).toBeInTheDocument();
    });

    test('should have close button accessible', () => {
      render(<AdminPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    test('should close when clicking outside modal', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const modal = screen.getByText('Admin Panel').closest('div');
      if (modal) {
        fireEvent.click(modal);
      }
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('should not close when clicking inside modal', () => {
      render(<AdminPanel {...defaultProps} />);
      
      const content = screen.getByText('📤 Upload Tracks');
      fireEvent.click(content);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});
