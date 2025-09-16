// Mock implementation of trackManagementService for testing
export const mockTracks = [
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

const trackManagementService = {
  getAllTracks: jest.fn().mockResolvedValue(mockTracks),
  getTotalTrackCount: jest.fn().mockResolvedValue(mockTracks.length),
  getTracksByCategory: jest.fn().mockResolvedValue(mockTracks),
  uploadTrack: jest.fn().mockResolvedValue({ success: true }),
  deleteTrack: jest.fn().mockResolvedValue({ success: true }),
  updateTrack: jest.fn().mockResolvedValue({ success: true }),
  approveTrack: jest.fn().mockResolvedValue({ success: true }),
  featureTrack: jest.fn().mockResolvedValue({ success: true }),
};

export default trackManagementService;










