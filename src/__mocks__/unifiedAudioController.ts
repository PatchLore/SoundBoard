// Mock implementation of unifiedAudioController for testing
const unifiedAudioController = {
  getCurrentState: jest.fn().mockReturnValue({
    currentTrack: null,
    isPlaying: false,
    volume: 50,
    currentTime: 0,
    duration: 0,
    isLooping: false,
    loopCount: 0,
    isBuffering: false,
  }),
  getVolume: jest.fn().mockReturnValue(50),
  on: jest.fn(),
  off: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  setVolume: jest.fn(),
  play: jest.fn(),
  stop: jest.fn(),
  seek: jest.fn(),
  setLoop: jest.fn(),
  getDuration: jest.fn().mockReturnValue(0),
  getCurrentTime: jest.fn().mockReturnValue(0),
  isPlaying: jest.fn().mockReturnValue(false),
  isPaused: jest.fn().mockReturnValue(true),
  isStopped: jest.fn().mockReturnValue(true),
  isBuffering: jest.fn().mockReturnValue(false),
  isLooping: jest.fn().mockReturnValue(false),
  getLoopCount: jest.fn().mockReturnValue(0),
  getCurrentTrack: jest.fn().mockReturnValue(null),
  setCurrentTrack: jest.fn(),
  clearCurrentTrack: jest.fn(),
  preloadTrack: jest.fn(),
  destroy: jest.fn(),
};

export default unifiedAudioController;


