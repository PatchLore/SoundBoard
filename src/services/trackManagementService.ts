import { Track, Category } from '../types/track';
import { STREAMING_CATEGORIES, updateCategoryTrackCount, getTotalTrackCount } from '../data/categories';

// Sample tracks data - in production this would come from a database
const SAMPLE_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Epic Boss Battle',
    artist: 'Epic Orchestral',
    duration: 165, // 2:45
    audioUrl: '/tracks/boss-battle/epic-orchestral-battle-01.mp3',
    coverUrl: '/covers/boss-battle-01.jpg',
    category: 'boss-battle',
    subcategory: 'orchestral',
    mood: 'epic',
    energy: 5,
    bpm: 140,
    key: 'C minor',
    tags: ['epic', 'orchestral', 'battle', 'intense'],
    description: 'Epic orchestral music for challenging boss battles',
    streamSafe: true,
    loopFriendly: true,
    hasIntro: true,
    hasOutro: true,
    dmcaSafe: true,
    uploadDate: '2024-01-15',
    uploadedBy: 'admin',
    approved: true,
    featured: true
  },
  {
    id: '2',
    title: 'Chill Lo-Fi Background',
    artist: 'Lo-Fi Vibes',
    duration: 260, // 4:20
    audioUrl: '/tracks/chill-gaming/lo-fi-background-01.mp3',
    coverUrl: '/covers/chill-gaming-01.jpg',
    category: 'chill-gaming',
    subcategory: 'lo-fi',
    mood: 'chill',
    energy: 2,
    bpm: 85,
    key: 'F major',
    tags: ['chill', 'lo-fi', 'relaxed', 'background'],
    description: 'Relaxing lo-fi music for casual gaming sessions',
    streamSafe: true,
    loopFriendly: true,
    hasIntro: false,
    hasOutro: false,
    dmcaSafe: true,
    uploadDate: '2024-01-14',
    uploadedBy: 'admin',
    approved: true,
    featured: false
  },
  {
    id: '3',
    title: 'Victory Fanfare',
    artist: 'Triumph Sounds',
    duration: 45, // 0:45
    audioUrl: '/tracks/intro-outro/victory-fanfare-01.mp3',
    coverUrl: '/covers/victory-01.jpg',
    category: 'intro-outro',
    subcategory: 'victory',
    mood: 'uplifting',
    energy: 4,
    bpm: 120,
    key: 'D major',
    tags: ['victory', 'celebration', 'fanfare', 'short'],
    description: 'Short victory fanfare for successful moments',
    streamSafe: true,
    loopFriendly: false,
    hasIntro: false,
    hasOutro: false,
    dmcaSafe: true,
    uploadDate: '2024-01-13',
    uploadedBy: 'admin',
    approved: true,
    featured: true
  }
];

class TrackManagementService {
  private tracks: Track[] = [...SAMPLE_TRACKS];
  private categories: Category[] = [...STREAMING_CATEGORIES];

  constructor() {
    this.updateCategoryTrackCounts();
  }

  // Get all tracks
  async getAllTracks(): Promise<Track[]> {
    return [...this.tracks];
  }

  // Get tracks by category
  async getTracksByCategory(categoryId: string): Promise<Track[]> {
    return this.tracks.filter(track => track.category === categoryId);
  }

  // Get featured tracks
  async getFeaturedTracks(): Promise<Track[]> {
    return this.tracks.filter(track => track.featured);
  }

  // Get tracks by energy level
  async getTracksByEnergy(energy: number): Promise<Track[]> {
    return this.tracks.filter(track => track.energy === energy);
  }

  // Get tracks by mood
  async getTracksByMood(mood: string): Promise<Track[]> {
    return this.tracks.filter(track => track.mood === mood);
  }

  // Search tracks
  async searchTracks(query: string): Promise<Track[]> {
    const lowerQuery = query.toLowerCase();
    return this.tracks.filter(track => 
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      track.description?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter tracks
  async filterTracks(filters: {
    category?: string;
    mood?: string[];
    energy?: number[];
    duration?: { min: number; max: number };
    bpm?: { min: number; max: number };
    loopFriendly?: boolean;
    tags?: string[];
    featured?: boolean;
  }): Promise<Track[]> {
    let filtered = [...this.tracks];

    if (filters.category) {
      filtered = filtered.filter(track => track.category === filters.category);
    }

    if (filters.mood && filters.mood.length > 0) {
      filtered = filtered.filter(track => filters.mood!.includes(track.mood));
    }

    if (filters.energy && filters.energy.length > 0) {
      filtered = filtered.filter(track => filters.energy!.includes(track.energy));
    }

    if (filters.duration) {
      filtered = filtered.filter(track => 
        track.duration >= filters.duration!.min && 
        track.duration <= filters.duration!.max
      );
    }

    if (filters.bpm) {
      filtered = filtered.filter(track => 
        track.bpm && 
        track.bpm >= filters.bpm!.min && 
        track.bpm <= filters.bpm!.max
      );
    }

    if (filters.loopFriendly !== undefined) {
      filtered = filtered.filter(track => track.loopFriendly === filters.loopFriendly);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(track => 
        track.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.featured !== undefined) {
      filtered = filtered.filter(track => track.featured === filters.featured);
    }

    return filtered;
  }

  // Upload new track
  async uploadTrack(trackData: Partial<Track>, audioFile: File): Promise<Track> {
    const newTrack: Track = {
      id: `track_${Date.now()}`,
      title: trackData.title || 'Untitled Track',
      artist: trackData.artist || 'Unknown Artist',
      duration: trackData.duration || 0,
      audioUrl: URL.createObjectURL(audioFile), // In production, upload to server
      coverUrl: trackData.coverUrl,
      category: trackData.category || 'chill-gaming',
      subcategory: trackData.subcategory || 'general',
      mood: trackData.mood || 'chill',
      energy: trackData.energy || 3,
      bpm: trackData.bpm,
      key: trackData.key,
      tags: trackData.tags || [],
      description: trackData.description,
      streamSafe: trackData.streamSafe ?? true,
      loopFriendly: trackData.loopFriendly ?? false,
      hasIntro: trackData.hasIntro ?? false,
      hasOutro: trackData.hasOutro ?? false,
      dmcaSafe: trackData.dmcaSafe ?? true,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: trackData.uploadedBy || 'admin',
      approved: trackData.approved ?? true,
      featured: trackData.featured ?? false
    };

    this.tracks.push(newTrack);
    this.updateCategoryTrackCounts();
    
    return newTrack;
  }

  // Update track
  async updateTrack(trackId: string, updates: Partial<Track>): Promise<Track | null> {
    const trackIndex = this.tracks.findIndex(track => track.id === trackId);
    if (trackIndex === -1) return null;

    this.tracks[trackIndex] = { ...this.tracks[trackIndex], ...updates };
    this.updateCategoryTrackCounts();
    
    return this.tracks[trackIndex];
  }

  // Delete track
  async deleteTrack(trackId: string): Promise<boolean> {
    const trackIndex = this.tracks.findIndex(track => track.id === trackId);
    if (trackIndex === -1) return false;

    this.tracks.splice(trackIndex, 1);
    this.updateCategoryTrackCounts();
    
    return true;
  }

  // Bulk upload tracks
  async bulkUploadTracks(files: File[]): Promise<Track[]> {
    const uploadedTracks: Track[] = [];
    
    for (const file of files) {
      if (file.type.includes('audio/')) {
        const trackData: Partial<Track> = {
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          artist: 'Unknown Artist',
          duration: 0, // Would need to extract from audio file
          category: 'chill-gaming', // Default category
          subcategory: 'general',
          mood: 'chill',
          energy: 3,
          tags: [],
          description: `Auto-uploaded track: ${file.name}`,
          streamSafe: true,
          loopFriendly: false,
          hasIntro: false,
          hasOutro: false,
          dmcaSafe: true,
          uploadedBy: 'admin',
          approved: false, // Require approval for bulk uploads
          featured: false
        };

        const track = await this.uploadTrack(trackData, file);
        uploadedTracks.push(track);
      }
    }

    return uploadedTracks;
  }

  // Get categories with track counts
  async getCategories(): Promise<Category[]> {
    return [...this.categories];
  }

  // Get smart playlists
  async getSmartPlaylists(): Promise<{ [key: string]: Track[] }> {
    return {
      'Gaming Essentials': this.tracks.filter(track => 
        ['boss-battle', 'gaming-action', 'chill-gaming'].includes(track.category)
      ),
      'Stream Workflow': this.tracks.filter(track => 
        ['stream-starting', 'break-brb', 'intro-outro'].includes(track.category)
      ),
      'High Energy': this.tracks.filter(track => track.energy >= 4),
      'Chill Vibes': this.tracks.filter(track => track.energy <= 2),
      'Featured Tracks': this.tracks.filter(track => track.featured),
      'Recently Added': this.tracks
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        .slice(0, 20)
    };
  }

  // Update category track counts
  private updateCategoryTrackCounts(): void {
    this.categories.forEach(category => {
      const count = this.tracks.filter(track => track.category === category.id).length;
      updateCategoryTrackCount(category.id, count);
    });
  }

  // Get total track count
  async getTotalTrackCount(): Promise<number> {
    return getTotalTrackCount();
  }

  // Get tracks by upload date
  async getTracksByDateRange(startDate: string, endDate: string): Promise<Track[]> {
    return this.tracks.filter(track => 
      track.uploadDate >= startDate && track.uploadDate <= endDate
    );
  }

  // Get tracks by uploader
  async getTracksByUploader(uploader: string): Promise<Track[]> {
    return this.tracks.filter(track => track.uploadedBy === uploader);
  }

  // Approve track
  async approveTrack(trackId: string): Promise<boolean> {
    const track = await this.updateTrack(trackId, { approved: true });
    return track !== null;
  }

  // Feature track
  async featureTrack(trackId: string): Promise<boolean> {
    const track = await this.updateTrack(trackId, { featured: true });
    return track !== null;
  }
}

const trackManagementService = new TrackManagementService();
export default trackManagementService;

