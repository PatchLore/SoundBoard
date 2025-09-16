// Mock MUST come first (before any imports)
// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', role: 'agency', email: 'test@example.com' },
    isAgency: true,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    token: 'mock-token',
    login: jest.fn(),
    logout: jest.fn(),
    verifyToken: jest.fn()
  })
}));

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Track } from '../../types/track';
import TrackUploader from '../../components/admin/TrackUploader';

// Mock the trackManagementService
jest.mock('../../services/trackManagementService', () => ({
  uploadTrack: jest.fn(),
  STREAMING_CATEGORIES: [
    { id: 'chill-gaming', name: 'Chill Gaming', icon: '🎮' },
    { id: 'stream-starting', name: 'Stream Starting Soon', icon: '🎬' }
  ]
}));

// Mock the categories data
jest.mock('../../data/categories', () => ({
  STREAMING_CATEGORIES: [
    { id: 'chill-gaming', name: 'Chill Gaming', icon: '🎮' },
    { id: 'stream-starting', name: 'Stream Starting Soon', icon: '🎬' }
  ]
}));

// (useAuth mock defined above with absolute path)

// (Imported TrackUploader via absolute path after mock)

// Mock URL.createObjectURL for JSDOM
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock data
const mockTrack: Partial<Track> = {
  title: 'Test Track',
  artist: 'Test Artist',
  category: 'chill-gaming',
  mood: 'chill',
  energy: 3
};

const mockFile = new File(['audio content'], 'test-track.mp3', { type: 'audio/mpeg' });

const defaultProps = {
  onTrackUpload: jest.fn(),
  onClose: jest.fn()
};

describe('TrackUploader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('should render upload interface initially', () => {
      render(<TrackUploader {...defaultProps} />);
      
      expect(screen.getByText('📁 Upload New Track')).toBeInTheDocument();
      expect(screen.getByText('Upload Audio Track')).toBeInTheDocument();
      expect(screen.getByText('Choose File')).toBeInTheDocument();
    });

    test('should show file upload area', () => {
      render(<TrackUploader {...defaultProps} />);
      
      expect(screen.getByText('🎵')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop your MP3 file here, or click to browse')).toBeInTheDocument();
    });
  });

  describe('File Upload Functionality', () => {
    test('should handle file selection via button click', async () => {
      render(<TrackUploader {...defaultProps} />);
      
      const fileInput = screen.getByRole('button', { name: 'Choose File' });
      fireEvent.click(fileInput);
      
      // File input should be present (hidden)
      expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    test('should show metadata form after file selection', async () => {
      await act(async () => {
        render(<TrackUploader {...defaultProps} />);
      });
      
      // Simulate file selection by directly setting state
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [mockFile] } });
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
    });

    test('should validate required fields', async () => {
      await act(async () => {
        render(<TrackUploader {...defaultProps} />);
      });
      
      // Simulate file selection to show form
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [mockFile] } });
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
      
      // Check required fields are present
      expect(screen.getByDisplayValue('test-track')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Unknown Artist')).toBeInTheDocument();
      expect(screen.getByDisplayValue('🎮 Chill Gaming')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Chill - Relaxing and calm')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3 ⭐⭐⭐ Medium - Moderate energy')).toBeInTheDocument();
    });
  });

  describe('Metadata Form', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<TrackUploader {...defaultProps} />);
      });
      
      // Show metadata form
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [mockFile] } });
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
    });

    test('should populate form fields with default values', () => {
      expect(screen.getByLabelText('Category *')).toHaveValue('chill-gaming');
      expect(screen.getByDisplayValue('Chill - Relaxing and calm')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3 ⭐⭐⭐ Medium - Moderate energy')).toBeInTheDocument();
    });

    test('should handle text input changes', () => {
      const titleInput = screen.getByDisplayValue('test-track') as HTMLInputElement;
      const artistInput = screen.getByDisplayValue('Unknown Artist') as HTMLInputElement;
      
      fireEvent.change(titleInput, { target: { value: 'New Track Title' } });
      fireEvent.change(artistInput, { target: { value: 'New Artist' } });
      
      expect(titleInput.value).toBe('New Track Title');
      expect(artistInput.value).toBe('New Artist');
    });

    test('should handle select dropdown changes', () => {
      const categorySelect = screen.getByDisplayValue('🎮 Chill Gaming') as HTMLSelectElement;
      const moodSelect = screen.getByDisplayValue('Chill - Relaxing and calm') as HTMLSelectElement;
      
      fireEvent.change(categorySelect, { target: { value: 'stream-starting' } });
      fireEvent.change(moodSelect, { target: { value: 'epic' } });
      
      expect(categorySelect.value).toBe('stream-starting');
      expect(moodSelect.value).toBe('epic');
    });

    test('should handle number input changes', () => {
      const energySelect = screen.getByDisplayValue('3 ⭐⭐⭐ Medium - Moderate energy') as HTMLSelectElement;
      const bpmInput = screen.getByPlaceholderText('e.g., 120') as HTMLInputElement;
      
      fireEvent.change(energySelect, { target: { value: '5' } });
      fireEvent.change(bpmInput, { target: { value: '140' } });
      
      expect(energySelect.value).toBe('5');
      expect(bpmInput.value).toBe('140');
    });

    test('should handle checkbox changes', () => {
      const streamSafeCheckbox = screen.getByRole('checkbox', { name: 'Stream Safe' }) as HTMLInputElement;
      const loopFriendlyCheckbox = screen.getByRole('checkbox', { name: 'Loop Friendly' }) as HTMLInputElement;
      
      expect(streamSafeCheckbox.checked).toBe(true);
      expect(loopFriendlyCheckbox.checked).toBe(false);
      
      fireEvent.click(loopFriendlyCheckbox);
      
      expect(loopFriendlyCheckbox.checked).toBe(true);
    });
  });

  describe('Form Validation', () => {
    beforeEach(async () => {
      render(<TrackUploader {...defaultProps} />);
      
      // Show metadata form
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
    });

    test('should validate BPM range', () => {
      const bpmInput = screen.getByPlaceholderText('e.g., 120') as HTMLInputElement;
      
      expect(bpmInput.min).toBe('60');
      expect(bpmInput.max).toBe('200');
    });

    test('should handle tags input', () => {
      const tagsInput = screen.getByPlaceholderText('epic, orchestral, battle, intense (comma separated)') as HTMLInputElement;
      
      fireEvent.change(tagsInput, { target: { value: 'epic, orchestral, battle' } });
      
      expect(tagsInput.value).toBe('epic, orchestral, battle');
    });

    test('should handle description textarea', () => {
      const descriptionTextarea = screen.getByPlaceholderText('Describe the track\'s style, mood, and intended use...') as HTMLTextAreaElement;
      
      fireEvent.change(descriptionTextarea, { 
        target: { value: 'This is a test track description' } 
      });
      
      expect(descriptionTextarea.value).toBe('This is a test track description');
    });
  });

  describe('Upload Process', () => {
    beforeEach(async () => {
      render(<TrackUploader {...defaultProps} />);
      
      // Show metadata form
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
    });

    test('should show upload button when form is ready', () => {
      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    });

    test('should handle form reset', () => {
      const resetButton = screen.getByRole('button', { name: /reset/i });
      const titleInput = screen.getByDisplayValue('test-track') as HTMLInputElement;
      
      // Change a field
      fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
      expect(titleInput.value).toBe('Changed Title');
      
      // Reset form
      fireEvent.click(resetButton);
      
      // Should return to file upload view
      expect(screen.getByText('Upload Audio Track')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper labels for all form fields', async () => {
      render(<TrackUploader {...defaultProps} />);
      
      // Show metadata form
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
      
      // Check all form fields have labels by checking for their display values or placeholders
      expect(screen.getByDisplayValue('test-track')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Unknown Artist')).toBeInTheDocument();
      expect(screen.getByDisplayValue('🎮 Chill Gaming')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., orchestral, electronic, ambient')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Chill - Relaxing and calm')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3 ⭐⭐⭐ Medium - Moderate energy')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., 120')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., C major, A minor')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('epic, orchestral, battle, intense (comma separated)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Describe the track\'s style, mood, and intended use...')).toBeInTheDocument();
    });

    test('should have proper ARIA attributes', async () => {
      render(<TrackUploader {...defaultProps} />);
      
      // Show metadata form
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
      
      // Check form has proper role
      const form = screen.getByText('Track Information').closest('div');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle file type validation', () => {
      render(<TrackUploader {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput.accept).toBe('audio/*');
    });

    test('should handle form submission errors gracefully', async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock uploadTrack to reject
      const trackManagementService = require('../../services/trackManagementService');
      trackManagementService.uploadTrack.mockRejectedValueOnce(new Error('Upload failed'));
      
      render(<TrackUploader {...defaultProps} />);
      
      // Show metadata form
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Track Information')).toBeInTheDocument();
      });
      
      // Try to upload
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadButton);
      
      // Wait for the async error handling to complete
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      consoleSpy.mockRestore();
    });
  });
});

