// import { StreamingTrack } from '../types/track';

export interface TrackUsage {
  trackId: string;
  usageCount: number;
  lastUsed: Date;
  agencyId?: string;
  streamerId?: string;
  favorite: boolean;
}

class UsageTrackingService {
  private storageKey = 'stream_soundboard_usage';
  private usageData: Map<string, TrackUsage> = new Map();

  constructor() {
    this.loadUsageData();
  }

  private loadUsageData(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.usageData = new Map(Object.entries(data));
        
        // Convert date strings back to Date objects
        this.usageData.forEach(usage => {
          if (usage.lastUsed) {
            usage.lastUsed = new Date(usage.lastUsed);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load usage data:', error);
    }
  }

  private saveUsageData(): void {
    try {
      const data = Object.fromEntries(this.usageData);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save usage data:', error);
    }
  }

  trackUsage(trackId: string, agencyId?: string, streamerId?: string): void {
    const existing = this.usageData.get(trackId);
    
    if (existing) {
      existing.usageCount += 1;
      existing.lastUsed = new Date();
      if (agencyId) existing.agencyId = agencyId;
      if (streamerId) existing.streamerId = streamerId;
    } else {
      this.usageData.set(trackId, {
        trackId,
        usageCount: 1,
        lastUsed: new Date(),
        agencyId,
        streamerId,
        favorite: false
      });
    }
    
    this.saveUsageData();
  }

  getTrackUsage(trackId: string): TrackUsage | undefined {
    return this.usageData.get(trackId);
  }

  getAllUsage(): TrackUsage[] {
    return Array.from(this.usageData.values());
  }

  getMostPopularTracks(limit: number = 10): TrackUsage[] {
    return Array.from(this.usageData.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  getRecentlyUsedTracks(limit: number = 10): TrackUsage[] {
    return Array.from(this.usageData.values())
      .filter(usage => usage.lastUsed)
      .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
      .slice(0, limit);
  }

  toggleFavorite(trackId: string): void {
    const usage = this.usageData.get(trackId);
    if (usage) {
      usage.favorite = !usage.favorite;
      this.saveUsageData();
    }
  }

  getFavoriteTracks(): TrackUsage[] {
    return Array.from(this.usageData.values())
      .filter(usage => usage.favorite)
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  getAgencyStats(agencyId: string): {
    totalTracks: number;
    totalUsage: number;
    mostUsedTrack?: TrackUsage;
    averageUsagePerTrack: number;
  } {
    const agencyTracks = Array.from(this.usageData.values())
      .filter(usage => usage.agencyId === agencyId);
    
    if (agencyTracks.length === 0) {
      return {
        totalTracks: 0,
        totalUsage: 0,
        averageUsagePerTrack: 0
      };
    }

    const totalUsage = agencyTracks.reduce((sum, track) => sum + track.usageCount, 0);
    const mostUsedTrack = agencyTracks.reduce((max, track) => 
      track.usageCount > max.usageCount ? track : max
    );

    return {
      totalTracks: agencyTracks.length,
      totalUsage,
      mostUsedTrack,
      averageUsagePerTrack: totalUsage / agencyTracks.length
    };
  }

  clearUsageData(): void {
    this.usageData.clear();
    localStorage.removeItem(this.storageKey);
  }
}

// Export as singleton
export const usageTrackingService = new UsageTrackingService();







