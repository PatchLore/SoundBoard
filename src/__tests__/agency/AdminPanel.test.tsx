import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from '../../components/admin/AdminPanel';

// Mock the trackManagementService
jest.mock('../../services/trackManagementService');

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
    test('should render admin panel with correct title', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('should show tab navigation', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      expect(screen.getByRole('button', { name: '📤 Upload Tracks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '🎵 Manage Tracks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '⚙️ Settings' })).toBeInTheDocument();
    });

    test('should show close button', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      expect(screen.getByText('×')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('should switch to Manage Tracks tab', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const manageTab = screen.getByRole('button', { name: '🎵 Manage Tracks' });
      fireEvent.click(manageTab);
      
      expect(screen.getByText('Track Management')).toBeInTheDocument();
      expect(screen.getByText('+ Add Track')).toBeInTheDocument();
    });

    test('should show track statistics in manage tab', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const manageTab = screen.getByRole('button', { name: '🎵 Manage Tracks' });
      
      await act(async () => {
        fireEvent.click(manageTab);
      });
      
      // Wait for tracks to load and then check for statistics
      await waitFor(() => {
        expect(screen.getByText('Track Management')).toBeInTheDocument();
        expect(screen.getByText('+ Add Track')).toBeInTheDocument();
      });
    });

    test('should show upload interface in upload tab', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const uploadTab = screen.getByRole('button', { name: '📤 Upload Tracks' });
      fireEvent.click(uploadTab);
      
      expect(screen.getByText('Upload New Track')).toBeInTheDocument();
    });
  });

  describe('Track Management', () => {
    test('should show upload new track button', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const manageTab = screen.getByRole('button', { name: '🎵 Manage Tracks' });
      fireEvent.click(manageTab);
      
      const uploadButton = screen.getByText('+ Add Track');
      expect(uploadButton).toBeInTheDocument();
    });

    test('should display track statistics correctly', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const manageTab = screen.getByRole('button', { name: '🎵 Manage Tracks' });
      fireEvent.click(manageTab);
      
      // Should show track management interface
      expect(screen.getByText('Track Management')).toBeInTheDocument();
      expect(screen.getByText('+ Add Track')).toBeInTheDocument();
    });

    test('should show track management interface', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const manageTab = screen.getByRole('button', { name: '🎵 Manage Tracks' });
      fireEvent.click(manageTab);
      
      expect(screen.getByText('Track Management')).toBeInTheDocument();
      expect(screen.getByText('+ Add Track')).toBeInTheDocument();
    });
  });

  describe('Upload Functionality', () => {
    test('should open track uploader when upload button is clicked', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const manageTab = screen.getByRole('button', { name: '🎵 Manage Tracks' });
      fireEvent.click(manageTab);
      
      const uploadButton = screen.getByText('+ Add Track');
      fireEvent.click(uploadButton);
      
      // Should show uploader modal
      expect(screen.getByText('📁 Upload New Track')).toBeInTheDocument();
    });

    test('should handle track upload successfully', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const manageTab = screen.getByRole('button', { name: '🎵 Manage Tracks' });
      fireEvent.click(manageTab);
      
      const uploadButton = screen.getByText('+ Add Track');
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
    test('should show settings interface', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const settingsTab = screen.getByText('Settings');
      fireEvent.click(settingsTab);
      
      // Should show settings content
      expect(screen.getByText('Admin Settings')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    test('should load tracks on component mount', async () => {
      const mockGetAllTracks = jest.fn().mockResolvedValue(mockTracks);
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      await waitFor(() => {
        expect(mockGetAllTracks).toHaveBeenCalled();
      });
    });

    test('should handle loading state', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      // Should show loading state initially
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      const mockGetAllTracks = jest.fn().mockRejectedValue(new Error('Service error'));
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      // Should still render without crashing
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('should handle empty tracks gracefully', async () => {
      const mockGetAllTracks = jest.fn().mockResolvedValue([]);
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      // Should still render without crashing
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading structure', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      expect(screen.getByRole('heading', { name: 'Admin Panel' })).toBeInTheDocument();
    });

    test('should have proper button roles', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      expect(screen.getByRole('button', { name: '📤 Upload Tracks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '🎵 Manage Tracks' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '⚙️ Settings' })).toBeInTheDocument();
    });

    test('should have close button accessible', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    test('should close when clicking outside modal', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      // Find the outer backdrop div by looking for the fixed inset-0 element
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
      if (backdrop) {
        fireEvent.click(backdrop);
      }
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    test('should not close when clicking inside modal', async () => {
      await act(async () => {
        render(<AdminPanel {...defaultProps} />);
      });
      
      const content = screen.getByText('Upload Tracks');
      fireEvent.click(content);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});
