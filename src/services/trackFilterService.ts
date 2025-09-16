import { Track } from '../types/track';

export interface TrackGroup {
  id: string;
  title: string;
  tracks: Track[];
  count: number;
}

export interface TrackFilterOptions {
  searchQuery: string;
  groupBy: 'mood' | 'category' | 'collection' | 'none';
  sortBy: 'title' | 'artist' | 'recent' | 'favorite';
  itemsPerPage: number;
  currentPage: number;
}

export class TrackFilterService {
  // Search tracks by title, artist, or tags
  static searchTracks(tracks: Track[], query: string): Track[] {
    if (!query.trim()) return tracks;
    
    const searchTerm = query.toLowerCase();
    return tracks.filter(track => 
      track.title.toLowerCase().includes(searchTerm) ||
      track.artist.toLowerCase().includes(searchTerm) ||
      track.category.toLowerCase().includes(searchTerm) ||
      track.mood.toLowerCase().includes(searchTerm) ||
      (track.tags && track.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }

  // Group tracks by different criteria
  static groupTracks(tracks: Track[], groupBy: TrackFilterOptions['groupBy']): TrackGroup[] {
    if (groupBy === 'none') {
      return [{
        id: 'all',
        title: 'All Tracks',
        tracks,
        count: tracks.length
      }];
    }

    const groups: { [key: string]: Track[] } = {};

    tracks.forEach(track => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'mood':
          groupKey = track.mood || 'Unknown';
          break;
        case 'category':
          groupKey = track.category || 'Unknown';
          break;
        case 'collection':
          // This would need collection context - for now use category
          groupKey = track.category || 'Unknown';
          break;
        default:
          groupKey = 'All';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(track);
    });

    return Object.entries(groups)
      .map(([key, tracks]) => ({
        id: key.toLowerCase().replace(/\s+/g, '-'),
        title: key,
        tracks,
        count: tracks.length
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }

  // Sort tracks
  static sortTracks(tracks: Track[], sortBy: TrackFilterOptions['sortBy']): Track[] {
    const sorted = [...tracks];
    
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'recent':
        return sorted.sort((a, b) => {
          const aTime = a.usageTracking?.lastUsed ? new Date(a.usageTracking.lastUsed).getTime() : 0;
          const bTime = b.usageTracking?.lastUsed ? new Date(b.usageTracking.lastUsed).getTime() : 0;
          return bTime - aTime;
        });
      case 'favorite':
        return sorted.sort((a, b) => {
          const aFav = a.usageTracking?.usageCount || 0;
          const bFav = b.usageTracking?.usageCount || 0;
          return bFav - aFav;
        });
      default:
        return sorted;
    }
  }

  // Paginate tracks
  static paginateTracks(tracks: Track[], page: number, itemsPerPage: number): {
    tracks: Track[];
    totalPages: number;
    hasMore: boolean;
    totalItems: number;
  } {
    const totalItems = tracks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      tracks: tracks.slice(startIndex, endIndex),
      totalPages,
      hasMore: page < totalPages,
      totalItems
    };
  }

  // Get recently played tracks (mock implementation)
  static getRecentlyPlayed(tracks: Track[], limit: number = 5): Track[] {
    return tracks
      .filter(track => track.usageTracking?.lastUsed)
      .sort((a, b) => {
        const aTime = new Date(a.usageTracking!.lastUsed!).getTime();
        const bTime = new Date(b.usageTracking!.lastUsed!).getTime();
        return bTime - aTime;
      })
      .slice(0, limit);
  }

  // Get most favorited tracks (mock implementation)
  static getMostFavorited(tracks: Track[], limit: number = 5): Track[] {
    return tracks
      .filter(track => track.usageTracking?.usageCount && track.usageTracking.usageCount > 0)
      .sort((a, b) => (b.usageTracking?.usageCount || 0) - (a.usageTracking?.usageCount || 0))
      .slice(0, limit);
  }

  // Apply all filters and return processed tracks
  static processTracks(
    tracks: Track[], 
    options: TrackFilterOptions
  ): {
    groups: TrackGroup[];
    pagination: {
      tracks: Track[];
      totalPages: number;
      hasMore: boolean;
      totalItems: number;
    };
  } {
    // Apply search
    let filteredTracks = this.searchTracks(tracks, options.searchQuery);
    
    // Apply sorting
    filteredTracks = this.sortTracks(filteredTracks, options.sortBy);
    
    // Group tracks
    const groups = this.groupTracks(filteredTracks, options.groupBy);
    
    // Paginate
    const pagination = this.paginateTracks(filteredTracks, options.currentPage, options.itemsPerPage);
    
    return { groups, pagination };
  }
}

export default TrackFilterService;



