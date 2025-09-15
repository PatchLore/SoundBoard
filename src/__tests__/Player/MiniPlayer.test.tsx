import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import MiniPlayer from '../../components/Player/MiniPlayer';
import unifiedAudioController from '../../services/unifiedAudioController';
import { StreamingTrack } from '../../types/track';

// Mock the unified audio controller
jest.mock('../../services/unifiedAudioController');

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockAudioController = unifiedAudioController as jest.Mocked<typeof unifiedAudioController>;

describe('MiniPlayer', () => {
  const mockTrack: StreamingTrack = {
    id: 'test-track-1',
    title: 'Test Track',
    artist: 'Test Artist',
    duration: 180,
    audioUrl: 'https://example.com/test.mp3',
    category: 'chill-gaming',
    subcategory: 'chill',
    mood: 'chill',
    energy: 3,
    bpm: 120,
    key: 'C major',
    tags: ['test', 'chill'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: null,
      isPlaying: false,
      volume: 50,
      currentTime: 0,
      duration: 0,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });
    
    mockAudioController.getVolume.mockReturnValue(50);
  });

  it('renders nothing when no track is playing in compact mode', () => {
    const { container } = render(<MiniPlayer compact />);
    expect(container.firstChild).toBeNull();
  });

  it('renders track info and controls when track is playing', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer />);

    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('0:30 / 3:00')).toBeInTheDocument();
    expect(screen.getByText('Chill Gaming')).toBeInTheDocument();
  });

  it('shows play button when track is paused', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: false,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer />);

    const playButton = screen.getByRole('button');
    expect(playButton).toBeInTheDocument();
    
    // Check for play icon (should be present when paused)
    const playIcon = playButton.querySelector('svg');
    expect(playIcon).toBeInTheDocument();
  });

  it('shows pause button when track is playing', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer />);

    const pauseButton = screen.getByRole('button');
    expect(pauseButton).toBeInTheDocument();
  });

  it('calls resume when play button is clicked', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: false,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer />);

    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);

    expect(mockAudioController.resume).toHaveBeenCalled();
  });

  it('calls pause when pause button is clicked', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer />);

    const pauseButton = screen.getByRole('button');
    fireEvent.click(pauseButton);

    expect(mockAudioController.pause).toHaveBeenCalled();
  });

  it('shows buffering indicator when track is buffering', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: true,
    });

    render(<MiniPlayer />);

    expect(screen.getByText('Buffering...')).toBeInTheDocument();
    
    // Check for buffering spinner
    const spinner = screen.getByText('Buffering...').parentElement?.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('disables play button when buffering', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: false,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: true,
    });

    render(<MiniPlayer />);

    const playButton = screen.getByRole('button');
    expect(playButton).toBeDisabled();
    expect(playButton).toHaveClass('cursor-not-allowed');
  });

  it('shows progress bar with correct progress', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 60, // 1 minute
      duration: 180,  // 3 minutes
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer />);

    const progressBar = document.querySelector('.bg-stream-accent');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle('width: 33.33333333333333%');
  });

  it('simulates buffering events correctly', async () => {
    let onBufferingStartCallback: (() => void) | undefined;
    let onBufferingEndCallback: (() => void) | undefined;

    mockAudioController.on.mockImplementation((event: string, callback: any) => {
      if (event === 'onBufferingStart') {
        onBufferingStartCallback = callback;
      } else if (event === 'onBufferingEnd') {
        onBufferingEndCallback = callback;
      }
    });

    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer />);

    // Initially not buffering
    expect(screen.queryByText('Buffering...')).not.toBeInTheDocument();

    // Simulate buffering start
    act(() => {
      if (onBufferingStartCallback) {
        onBufferingStartCallback();
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Buffering...')).toBeInTheDocument();
    });

    // Simulate buffering end
    act(() => {
      if (onBufferingEndCallback) {
        onBufferingEndCallback();
      }
    });

    await waitFor(() => {
      expect(screen.queryByText('Buffering...')).not.toBeInTheDocument();
    });
  });

  it('handles volume changes when volume control is shown', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer showVolume />);

    const volumeSlider = screen.getByRole('slider');
    expect(volumeSlider).toBeInTheDocument();

    fireEvent.change(volumeSlider, { target: { value: '75' } });

    expect(mockAudioController.setVolume).toHaveBeenCalledWith(75);
  });

  it('formats time correctly', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 125, // 2:05
      duration: 180,    // 3:00
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer />);

    expect(screen.getByText('2:05 / 3:00')).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    mockAudioController.getCurrentState.mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 50,
      currentTime: 30,
      duration: 180,
      isLooping: false,
      loopCount: 0,
      isBuffering: false,
    });

    render(<MiniPlayer compact />);

    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    
    // Progress bar should not be visible in compact mode
    expect(screen.queryByText('0:30 / 3:00')).not.toBeInTheDocument();
  });
});
