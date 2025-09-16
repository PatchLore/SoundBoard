class StreamerFavoritesService {
  private storageKey = 'music_streamer_favorites';

  // Get all favorites for a streamer
  getFavorites(streamerId: string): string[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const favorites = JSON.parse(data);
        return favorites[streamerId] || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading streamer favorites:', error);
      return [];
    }
  }

  // Add a track to favorites
  addToFavorites(streamerId: string, trackId: string): boolean {
    try {
      const data = localStorage.getItem(this.storageKey);
      const favorites = data ? JSON.parse(data) : {};
      
      if (!favorites[streamerId]) {
        favorites[streamerId] = [];
      }
      
      if (!favorites[streamerId].includes(trackId)) {
        favorites[streamerId].push(trackId);
        localStorage.setItem(this.storageKey, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  // Remove a track from favorites
  removeFromFavorites(streamerId: string, trackId: string): boolean {
    try {
      const data = localStorage.getItem(this.storageKey);
      const favorites = data ? JSON.parse(data) : {};
      
      if (favorites[streamerId]) {
        const index = favorites[streamerId].indexOf(trackId);
        if (index > -1) {
          favorites[streamerId].splice(index, 1);
          localStorage.setItem(this.storageKey, JSON.stringify(favorites));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  // Toggle favorite status
  toggleFavorite(streamerId: string, trackId: string): boolean {
    const favorites = this.getFavorites(streamerId);
    if (favorites.includes(trackId)) {
      return this.removeFromFavorites(streamerId, trackId);
    } else {
      return this.addToFavorites(streamerId, trackId);
    }
  }

  // Check if a track is favorited
  isFavorited(streamerId: string, trackId: string): boolean {
    const favorites = this.getFavorites(streamerId);
    return favorites.includes(trackId);
  }

  // Get all streamers who have favorited a track
  getTrackFavoritedBy(trackId: string): string[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const favorites = JSON.parse(data);
        return Object.keys(favorites).filter(streamerId => 
          favorites[streamerId].includes(trackId)
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting track favorites:', error);
      return [];
    }
  }
}

const streamerFavoritesService = new StreamerFavoritesService();
export default streamerFavoritesService;
