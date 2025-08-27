import { Track } from '../types/track';

export interface MusicGenerationOptions {
  category: string;
  count: number;
  duration?: number;
}

export interface MusicServiceConfig {
  demoMode: boolean;
  maxUploadSize: number; // in MB
  allowedFormats: string[];
}

class MusicService {
  private config: MusicServiceConfig = {
    demoMode: true,
    maxUploadSize: 50, // 50MB max file size
    allowedFormats: ['mp3', 'wav', 'ogg', 'm4a']
  };

  constructor() {
    // Auto-detect demo mode - no API keys needed
    this.config.demoMode = true;
  }

  /**
   * Check if the service is in demo mode
   */
  isDemoMode(): boolean {
    return this.config.demoMode;
  }

  /**
   * Get demo mode status message
   */
  getDemoModeMessage(): string {
    return this.isDemoMode() 
      ? '🎵 Demo Mode: Manual uploads only. Add API keys for AI generation.'
      : '🤖 Live Mode: AI music generation enabled.';
  }

  /**
   * Validate uploaded file
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSizeBytes = this.config.maxUploadSize * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `File size exceeds ${this.config.maxUploadSize}MB limit` 
      };
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.config.allowedFormats.includes(extension)) {
      return { 
        valid: false, 
        error: `File format not supported. Allowed: ${this.config.allowedFormats.join(', ')}` 
      };
    }

    return { valid: true };
  }

  /**
   * Process uploaded file and create track metadata
   */
  async processUpload(file: File, metadata: Partial<Track>): Promise<Track> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create a unique ID for the track
    const trackId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the track object with all required properties
    const track: Track = {
      id: trackId,
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      artist: metadata.artist || 'Manual Upload',
      duration: metadata.duration || 0, // Will be calculated when audio loads
      category: metadata.category || 'chill-gaming',
      subcategory: metadata.subcategory || 'manual',
      mood: metadata.mood || 'chill',
      energy: metadata.energy || 2,
      audioUrl: URL.createObjectURL(file),
      tags: metadata.tags || ['manual', 'upload'],
      streamSafe: metadata.streamSafe ?? true,
      loopFriendly: metadata.loopFriendly ?? true,
      hasIntro: metadata.hasIntro ?? false,
      hasOutro: metadata.hasOutro ?? false,
      dmcaSafe: metadata.dmcaSafe ?? true,
      approved: true,
      featured: false,
      uploadDate: new Date().toISOString(),
      uploadedBy: metadata.uploadedBy || 'user',
      ...metadata
    };

    return track;
  }

  /**
   * Get available categories for manual uploads
   */
  getUploadCategories(): string[] {
    return [
      'chill-gaming',
      'gaming-action', 
      'stream-starting',
      'hype-raid',
      'break-brb',
      'talk-show',
      'intro-outro',
      'boss-battle',
      'intermission',
      'background-chat'
    ];
  }

  /**
   * Get category display names
   */
  getCategoryDisplayName(categoryId: string): string {
    const categoryMap: Record<string, string> = {
      'chill-gaming': 'Chill Gaming',
      'gaming-action': 'Gaming Action',
      'stream-starting': 'Stream Starting',
      'hype-raid': 'Hype Raid',
      'break-brb': 'Break/BRB',
      'talk-show': 'Talk Show',
      'intro-outro': 'Intro/Outro',
      'boss-battle': 'Boss Battle',
      'intermission': 'Intermission',
      'background-chat': 'Background Chat'
    };

    return categoryMap[categoryId] || categoryId;
  }

  /**
   * Get service configuration
   */
  getConfig(): MusicServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<MusicServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get demo tracks for testing
   */
  getDemoTracks(): Track[] {
    return [
      {
        id: 'demo_1',
        title: 'Demo Chill Track',
        artist: 'Demo Artist',
        duration: 180,
        category: 'chill-gaming',
        subcategory: 'demo',
        mood: 'chill',
        energy: 2,
        audioUrl: '/audio/demo-chill.mp3',
        tags: ['demo', 'chill', 'gaming'],
        streamSafe: true,
        loopFriendly: true,
        hasIntro: false,
        hasOutro: false,
        dmcaSafe: true,
        approved: true,
        featured: false,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'system'
      },
      {
        id: 'demo_2',
        title: 'Demo Action Track',
        artist: 'Demo Artist',
        duration: 120,
        category: 'gaming-action',
        subcategory: 'demo',
        mood: 'energetic',
        energy: 4,
        audioUrl: '/audio/demo-action.mp3',
        tags: ['demo', 'action', 'gaming'],
        streamSafe: true,
        loopFriendly: true,
        hasIntro: false,
        hasOutro: false,
        dmcaSafe: true,
        approved: true,
        featured: false,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'system'
      }
    ];
  }

  /**
   * Check if AI generation is available
   */
  canGenerateAI(): boolean {
    return !this.isDemoMode();
  }

  /**
   * Get AI generation status
   */
  getAIGenerationStatus(): { available: boolean; message: string } {
    if (this.canGenerateAI()) {
      return {
        available: true,
        message: 'AI music generation is available'
      };
    } else {
      return {
        available: false,
        message: 'AI generation requires API keys. Currently in demo mode.'
      };
    }
  }
}

// Create and export singleton instance
const musicService = new MusicService();
export default musicService;
