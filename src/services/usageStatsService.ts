import { Track } from '../types/track';

export interface StreamerUsageStats {
  streamerId: string;
  totalPlayTime: number;
  trackCount: number;
  lastActive: Date;
  favoriteMoods: string[];
  favoriteGenres: string[];
  peakUsageHours: number[];
}

export interface AgencyUsageStats {
  totalPlayTime: number;
  totalTracks: number;
  totalStreamers: number;
  lastActive: Date;
  favoriteMoods: string[];
  favoriteGenres: string[];
  peakUsageHours: number[];
}

class UsageStatsService {
  private storageKey = 'music_usage_stats';
  private usageData: Map<string, StreamerUsageStats> = new Map();

  constructor() {
    this.loadUsageData();
  }

  private loadUsageData(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.usageData = new Map(Object.entries(parsed));
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

  trackUsage(streamerId: string, track: Track): void {
    const existing = this.usageData.get(streamerId);
    
    if (existing) {
      existing.totalPlayTime += track.duration;
      existing.trackCount += 1;
      existing.lastActive = new Date();
      if (track.mood) existing.favoriteMoods.push(track.mood);
      if (track.genre) existing.favoriteGenres.push(track.genre);
      existing.peakUsageHours.push(new Date().getHours());
    } else {
      this.usageData.set(streamerId, {
        streamerId: streamerId,
        totalPlayTime: track.duration,
        trackCount: 1,
        lastActive: new Date(),
        favoriteMoods: track.mood ? [track.mood] : [],
        favoriteGenres: track.genre ? [track.genre] : [],
        peakUsageHours: [new Date().getHours()]
      });
    }
    
    this.saveUsageData();
  }

  getStreamerStats(streamerId: string): StreamerUsageStats | undefined {
    return this.usageData.get(streamerId);
  }

  getAgencyStats(): AgencyUsageStats {
    const totalPlayTime = Array.from(this.usageData.values())
      .reduce((acc, stats) => acc + stats.totalPlayTime, 0);
    
    const totalTracks = Array.from(this.usageData.values())
      .reduce((acc, stats) => acc + stats.trackCount, 0);
    
    const totalStreamers = this.usageData.size;
    
    const lastActive = Array.from(this.usageData.values())
      .reduce((acc, stats) => acc > stats.lastActive ? acc : stats.lastActive, new Date(0));
    
    const favoriteMoods = Array.from(this.usageData.values())
      .reduce((acc, stats) => acc.concat(stats.favoriteMoods), [] as string[]);
    
    const favoriteGenres = Array.from(this.usageData.values())
      .reduce((acc, stats) => acc.concat(stats.favoriteGenres), [] as string[]);
    
    const peakUsageHours = Array.from(this.usageData.values())
      .reduce((acc, stats) => acc.concat(stats.peakUsageHours), [] as number[]);
    
    return {
      totalPlayTime,
      totalTracks,
      totalStreamers,
      lastActive,
      favoriteMoods,
      favoriteGenres,
      peakUsageHours
    };
  }

  clearUsageData(): void {
    this.usageData.clear();
    this.saveUsageData();
  }
}

const usageStatsService = new UsageStatsService();
export default usageStatsService;
