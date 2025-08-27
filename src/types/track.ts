export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  
  // Streaming-specific metadata
  category: 'stream-starting' | 'chill-gaming' | 'gaming-action' | 'hype-raid' | 'break-brb' | 'talk-show' | 'intro-outro' | 'boss-battle' | 'intermission' | 'background-chat';
  subcategory: string;
  mood: 'chill' | 'epic' | 'energetic' | 'mysterious' | 'uplifting' | 'dark' | 'peaceful';
  energy: 1 | 2 | 3 | 4 | 5; // 1=very chill, 5=high energy
  bpm?: number;
  key?: string;
  tags: string[];
  description?: string;
  
  // Usage metadata
  streamSafe: boolean;
  loopFriendly: boolean;
  hasIntro: boolean;
  hasOutro: boolean;
  dmcaSafe: boolean;
  
  // Admin metadata
  uploadDate: string;
  uploadedBy: string;
  approved: boolean;
  featured: boolean;
  
  // Legacy fields for backward compatibility
  streamingCategory?: string;
  genre?: string;
  energyLevel?: string; // For backward compatibility
  vodSafe?: boolean;
  license?: string;
  licenseDetails?: string;
  platformCompliance?: {
    twitch: string;
    youtube: string;
    facebook: string;
    tiktok: string;
  };
  usageTracking?: {
    usageCount: number;
    lastUsed?: Date;
  };
  agencyNotes?: string;
}

// Backward compatibility alias
export type StreamingTrack = Track;

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  trackCount: number;
}

export interface FilterOptions {
  category?: string;
  mood?: string[];
  energy?: number[];
  duration?: { min: number; max: number };
  bpm?: { min: number; max: number };
  loopFriendly?: boolean;
  tags?: string[];
  featured?: boolean;
}

export interface AgencyTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  customCSS?: string;
  brandedCategories?: { [key: string]: string };
  customPlaylists?: string[];
}

// Legacy interface for backward compatibility
export interface LegacyTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  streamingCategory: string;
  genre: string;
  mood: string;
  energyLevel: string;
  tags: string[];
  description: string;
  dmcaSafe: boolean;
  vodSafe: boolean;
  license: string;
  licenseDetails: string;
  platformCompliance: {
    twitch: string;
    youtube: string;
    facebook: string;
    tiktok: string;
  };
  usageTracking: {
    usageCount: number;
    lastUsed?: Date;
  };
  agencyNotes: string;
}

// Helper functions for backward compatibility
export const getEnergyLevel = (track: Track): string => {
  if (track.energyLevel) return track.energyLevel;
  if (track.energy) {
    if (track.energy <= 2) return 'low';
    if (track.energy <= 3) return 'medium';
    return 'high';
  }
  return 'medium';
};

export const getEnergyLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'low': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'high': return 'bg-red-600/20 text-red-400 border-red-600/30';
    default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
  }
};

export const getStreamingCategory = (track: Track): string => {
  return track.streamingCategory || track.category || 'unknown';
};

