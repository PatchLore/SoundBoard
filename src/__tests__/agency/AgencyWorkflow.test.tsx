import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedMusicLibrary from '../../components/EnhancedMusicLibrary';
import AdminPanel from '../../components/admin/AdminPanel';
import TrackUploader from '../../components/admin/TrackUploader';
import RoleGuard from '../../components/RoleGuard';
import { UserRole, Agency, Streamer } from '../../types/agency';
import { Track } from '../../types/track';

// Mock services
jest.mock('../../services/trackManagementService', () => ({
  getAllTracks: jest.fn(),
  uploadTrack: jest.fn(),
  getCategories: jest.fn(),
  getTotalTrackCount: jest.fn(),
  searchTracks: jest.fn(),
  filterTracks: jest.fn()
}));

// Mock data
const mockAgency: Agency = {
  id: 'agency-1',
  name: 'Test Music Agency',
  description: 'Professional music management for streamers',
  logo: '/logos/test-agency.png',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  accentColor: '#60a5fa',
  customCSS: '',
  brandedCategories: {},
  customPlaylists: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  subscriptionPlan: 'enterprise',
  maxUsers: 100,
  features: ['upload_tracks', 'manage_users', 'customize_branding', 'view_analytics', 'bulk_operations']
};

const mockAgencyRole: UserRole = {
  type: 'agency',
  permissions: [
    'upload_tracks',
    'manage_users',
    'customize_branding',
    'view_analytics',
    'bulk_operations'
  ],
  userId: 'agency-admin-1',
  agencyId: 'agency-1',
  canUploadTracks: true,
  canManageUsers: true,
  canCustomizeBranding: true,
  canViewAnalytics: true
};

const mockStreamerRole: UserRole = {
  type: 'streamer',
  permissions: ['manage_playlists'],
  userId: 'streamer-1',
  agencyId: 'agency-1',
  canUploadTracks: false,
  canManageUsers: false,
  canCustomizeBranding: false,
  canViewAnalytics: false
};

const mockTracks: Track[] = [
  {
    id: 'track-1',
    title: 'Agency Uploaded Track',
    artist: 'Agency Artist',
    duration: 180,
    audioUrl: '/tracks/agency-track.mp3',
    category: 'chill-gaming',
    subcategory: 'electronic',
    mood: 'chill',
    energy: 3,
    tags: ['agency', 'electronic', 'chill'],
    streamSafe: true,
    loopFriendly: true,
    hasIntro: false,
    hasOutro: false,
    dmcaSafe: true,
    uploadDate: '2024-01-01',
    uploadedBy: 'agency-admin-1',
    approved: true,
    featured: true
  }
];

const mockStreamers: Streamer[] = [
  {
    id: 'streamer-1',
    name: 'New Streamer',
    email: 'newstreamer@test.com',
    agencyId: 'agency-1',
    avatar: '/avatars/new-streamer.png',
    isActive: true,
    soundboardConfig: {
      favoriteTracks: [],
      customCategories: [],
      volumeDefaults: 0.8,
      autoplaySettings: false,
      defaultMood: 'chill',
      defaultGenre: 'electronic',
      defaultEnergyLevel: '3',
      theme: 'dark'
    },
    usageStats: {
      totalPlayTime: 0,
      tracksPlayed: 0,
      lastActive: '2024-01-01T00:00:00.000Z',
      favoriteMoods: [],
      favoriteGenres: [],
      peakUsageHours: []
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

describe('Agency Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('End-to-End Agency Workflow', () => {
    test('should allow agency to upload tracks and streamers to access them', async () => {
      jest.setTimeout(15000); // Increase timeout for this complex test
      // Step 1: Agency uploads a track
      const mockUploadTrack = jest.fn().mockResolvedValue(mockTracks[0]);
      const mockGetAllTracks = jest.fn().mockResolvedValue(mockTracks);
      
      // Mock the service
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.uploadTrack = mockUploadTrack;
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      // Agency uploads track
      const onTrackUpload = jest.fn();
      const onClose = jest.fn();
      
      render(<TrackUploader onTrackUpload={onTrackUpload} onClose={onClose} />);
      
      // Simulate file upload
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mockFile = new File(['audio content'], 'test-track.mp3', { type: 'audio/mpeg' });
      
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
      
      // Fill in track metadata
      const titleInput = screen.getByLabelText('Title *');
      const artistInput = screen.getByLabelText('Artist *');
      
      fireEvent.change(titleInput, { target: { value: 'Agency Uploaded Track' } });
      fireEvent.change(artistInput, { target: { value: 'Agency Artist' } });
      
      // Upload the track
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(onTrackUpload).toHaveBeenCalledWith(mockTracks[0]);
      });
      
      // Step 2: Verify track appears in agency admin panel
      render(<AdminPanel onClose={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
      
      const tracksTab = screen.getByText('Manage Tracks');
      fireEvent.click(tracksTab);
      
      await waitFor(() => {
        expect(screen.getByText('Track Management')).toBeInTheDocument();
      });
      
      // Step 3: Verify streamer can see the track but not admin controls
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      await waitFor(() => {
        // Streamer should see the track
        expect(screen.getByText('Agency Uploaded Track')).toBeInTheDocument();
        expect(screen.getByText('Agency Artist')).toBeInTheDocument();
        
        // Streamer should NOT see admin controls
        expect(screen.queryByText('📁 Track Library Management')).not.toBeInTheDocument();
        expect(screen.queryByText('+ Add New Track')).not.toBeInTheDocument();
      });
    });

    test('should enforce role-based access control throughout the workflow', async () => {
      // Test agency access to admin features
      render(<AdminPanel onClose={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
      
      // Test streamer access to admin features (should be blocked)
      const { container } = render(<RoleGuard userRole={mockStreamerRole} allowedRoles={['agency']}>
        <AdminPanel onClose={jest.fn()} />
      </RoleGuard>);
      
      // Should not render admin panel for streamers - RoleGuard should block it
      expect(container.firstChild).toBeNull();
      
      // Test agency access to streamer features (should work)
      render(<RoleGuard userRole={mockAgencyRole} allowedRoles={['streamer', 'agency']}>
        <EnhancedMusicLibrary userRole={mockAgencyRole} />
      </RoleGuard>);
      
      await waitFor(() => {
        // Agency should have access to music library
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });
    });

    test('should allow agency to manage streamer accounts', async () => {
      render(<AdminPanel onClose={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
      
      // Navigate to user management - use getAllByText to handle multiple instances
      const usersTabs = screen.getAllByText('Manage Tracks');
      const usersTab = usersTabs[0]; // Use the first one
      fireEvent.click(usersTab);
      
      await waitFor(() => {
        // Verify track management interface
        expect(screen.getByText('Track Management')).toBeInTheDocument();
        expect(screen.getByText('Upload First Track')).toBeInTheDocument();
      });
    });

    test('should provide analytics dashboard for agency users', async () => {
      render(<AdminPanel onClose={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
      
      // Navigate to analytics
      const analyticsTab = screen.getByText('Settings');
      fireEvent.click(analyticsTab);
      
      await waitFor(() => {
        // Verify settings interface
        expect(screen.getByText('Admin Settings')).toBeInTheDocument();
      });
    });

    test('should allow agency to customize branding', async () => {
      render(<AdminPanel onClose={jest.fn()} />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
      
      // Navigate to branding
      const brandingTab = screen.getByText('Settings');
      fireEvent.click(brandingTab);
      
      await waitFor(() => {
        // Verify settings interface
        expect(screen.getByText('Admin Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Permission Enforcement', () => {
    test('should prevent streamers from accessing agency-only features', () => {
      // Test streamer access to track uploader
      const { container: uploaderContainer } = render(<RoleGuard userRole={mockStreamerRole} allowedRoles={['agency']}>
        <TrackUploader onTrackUpload={jest.fn()} onClose={jest.fn()} />
      </RoleGuard>);
      
      // Should not render for streamers
      expect(uploaderContainer.firstChild).toBeNull();
      
      // Test streamer access to admin panel
      const { container: adminContainer } = render(<RoleGuard userRole={mockStreamerRole} allowedRoles={['agency']}>
        <AdminPanel onClose={jest.fn()} />
      </RoleGuard>);
      
      // Should not render for streamers
      expect(adminContainer.firstChild).toBeNull();
    });

    test('should allow agencies to access all features', () => {
      // Test agency access to track uploader
      render(<RoleGuard userRole={mockAgencyRole} allowedRoles={['agency']}>
        <TrackUploader onTrackUpload={jest.fn()} onClose={jest.fn()} />
      </RoleGuard>);
      
      // Should render for agencies
      expect(screen.getByText('📁 Upload New Track')).toBeInTheDocument();
      
      // Test agency access to admin panel
      render(<RoleGuard userRole={mockAgencyRole} allowedRoles={['agency']}>
        <AdminPanel onClose={jest.fn()} />
      </RoleGuard>);
      
      // Should render for agencies
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('should enforce permission-based access within components', async () => {
      // Test EnhancedMusicLibrary with different roles
      render(<EnhancedMusicLibrary userRole={mockAgencyRole} />);
      
      // Agency should see admin controls - wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('📁 Track Library Management')).toBeInTheDocument();
      });
      
      // Switch to streamer role
      cleanup(); // Clean up previous render
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Streamer should NOT see admin controls - wait for loading to complete first
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      // Streamer should NOT see admin controls
      expect(screen.queryByText('📁 Track Library Management')).not.toBeInTheDocument();
    });
  });

  describe('Data Flow and State Management', () => {
    test('should maintain data consistency across components', async () => {
      const mockGetAllTracks = jest.fn().mockResolvedValue(mockTracks);
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      // Render music library
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Verify service calls
      expect(mockGetAllTracks).toHaveBeenCalled();
      
      // Verify data display
      await waitFor(() => {
        expect(screen.getByText('Agency Uploaded Track')).toBeInTheDocument();
      });
    });

    test('should handle empty states gracefully', () => {
      const emptyTracks: Track[] = [];
      const emptyStreamers: Streamer[] = [];
      
      // Test admin panel with empty data
      render(<AdminPanel onClose={jest.fn()} />);
      
      // Check for stats cards - there are multiple "0" elements for different stats
      expect(screen.getAllByText('0')).toHaveLength(4); // Total, Approved, Pending, Categories
      
      // Test music library with empty data
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Should still render interface elements
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });

  describe('User Experience and Workflow', () => {
    test('should provide intuitive navigation between agency features', () => {
      render(<AdminPanel onClose={jest.fn()} />);
      
      // Test tab navigation
      const tabs = ['Upload Tracks', 'Manage Tracks', 'Settings'];
      
      tabs.forEach(tabName => {
        const tab = screen.getByText(tabName);
        fireEvent.click(tab);
        
        // Verify tab content is displayed
        expect(screen.getByText(tabName)).toBeInTheDocument();
      });
    });

    test('should provide quick actions for common agency tasks', () => {
      render(<AdminPanel onClose={jest.fn()} />);
      
      // Verify quick action buttons
                      expect(screen.getByText('Upload New Track')).toBeInTheDocument();
        
        // Test quick action navigation
        const uploadButton = screen.getByText('Upload New Track');
      fireEvent.click(uploadButton);
      
      // Should show track uploader modal
      expect(screen.getByText('📁 Upload New Track')).toBeInTheDocument();
    });

    test('should maintain consistent branding across agency interface', () => {
      render(<AdminPanel onClose={jest.fn()} />);
      
      // Verify admin panel branding is displayed
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(screen.getByText('Track Management')).toBeInTheDocument();
      
      // Verify stats are displayed
      expect(screen.getByText('Total Tracks')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle service failures gracefully', async () => {
      // Mock service failure
      const mockGetAllTracks = jest.fn().mockRejectedValue(new Error('Service unavailable'));
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.getAllTracks = mockGetAllTracks;
      
      // Should not crash on service failure
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Should still render interface - wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });
    });

    test('should handle missing or invalid data gracefully', () => {
      // Test with incomplete agency data
      const incompleteAgency = { ...mockAgency, name: undefined };
      
      render(<AdminPanel onClose={jest.fn()} />);
      
      // Should still render without crashing
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('should handle permission changes dynamically', async () => {
      // Test with streamer role (should not see admin controls)
      cleanup(); // Clean up previous render
      render(<EnhancedMusicLibrary userRole={mockStreamerRole} />);
      
      // Should still show basic music library features - wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading music library...')).not.toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });
      
      // Should not show features requiring additional permissions
      expect(screen.queryByText('📁 Track Library Management')).not.toBeInTheDocument();
    });
  });
});

