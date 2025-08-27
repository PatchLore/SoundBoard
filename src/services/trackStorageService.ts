import { StreamingTrack } from '../types/track';

export interface TrackCollection {
  id: string;
  name: string;
  description?: string;
  tracks: string[]; // Track IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  description?: string;
  collections: TrackCollection[];
  createdAt: Date;
  updatedAt: Date;
}

class TrackStorageService {
  // Storage keys
  private readonly STORAGE_KEYS = {
    TRACKS: 'music_tracks',
    CLIENTS: 'music_clients',
    RECENTLY_GENERATED: 'music_recently_generated',
    SETTINGS: 'music_settings'
  };

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Initialize storage if it doesn't exist
    if (!localStorage.getItem(this.STORAGE_KEYS.TRACKS)) {
      localStorage.setItem(this.STORAGE_KEYS.TRACKS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.CLIENTS)) {
      localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.RECENTLY_GENERATED)) {
      localStorage.setItem(this.STORAGE_KEYS.RECENTLY_GENERATED, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify({
        defaultClient: 'default',
        autoSave: true,
        maxRecentTracks: 50
      }));
    }
  }

  // Track Management
  public saveTrack(track: StreamingTrack): void {
    const tracks = this.getAllTracks();
    const existingIndex = tracks.findIndex(t => t.id === track.id);
    
    if (existingIndex >= 0) {
      tracks[existingIndex] = {
        ...track,
        usageTracking: {
          usageCount: (track.usageTracking?.usageCount ?? 0),
          lastUsed: new Date()
        }
      };
    } else {
      tracks.push({
        ...track,
        usageTracking: {
          usageCount: (track.usageTracking?.usageCount ?? 0),
          lastUsed: new Date()
        }
      });
    }
    
    localStorage.setItem(this.STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
    this.addToRecentlyGenerated(track.id);
    
    console.log(`💾 Track saved: ${track.title}`);
  }

  public getTrack(trackId: string): StreamingTrack | null {
    const tracks = this.getAllTracks();
    return tracks.find(t => t.id === trackId) || null;
  }

  public getAllTracks(): StreamingTrack[] {
    try {
      const tracksData = localStorage.getItem(this.STORAGE_KEYS.TRACKS);
      return tracksData ? JSON.parse(tracksData) : [];
    } catch (error) {
      console.error('Error loading tracks from storage:', error);
      return [];
    }
  }

  public deleteTrack(trackId: string): boolean {
    const tracks = this.getAllTracks();
    const filteredTracks = tracks.filter(t => t.id !== trackId);
    
    if (filteredTracks.length < tracks.length) {
      localStorage.setItem(this.STORAGE_KEYS.TRACKS, JSON.stringify(filteredTracks));
      this.removeFromRecentlyGenerated(trackId);
      console.log(`🗑️ Track deleted: ${trackId}`);
      return true;
    }
    return false;
  }

  public searchTracks(query: string, filters?: {
    mood?: string;
    genre?: string;
    energyLevel?: string;
    category?: string;
  }): StreamingTrack[] {
    const tracks = this.getAllTracks();
    const queryLower = query.toLowerCase();
    
    return tracks.filter(track => {
      // Text search
      const matchesQuery = 
        track.title.toLowerCase().includes(queryLower) ||
        track.description?.toLowerCase().includes(queryLower) ||
        track.tags.some(tag => tag.toLowerCase().includes(queryLower));
      
      if (!matchesQuery) return false;
      
      // Apply filters
      if (filters?.mood && track.mood !== filters.mood) return false;
      if (filters?.genre && track.genre !== filters.genre) return false;
      if (filters?.energyLevel && track.energyLevel !== filters.energyLevel) return false;
      if (filters?.category && track.streamingCategory !== filters.category) return false;
      
      return true;
    });
  }

  // Recently Generated Tracks
  private addToRecentlyGenerated(trackId: string): void {
    const recent = this.getRecentlyGenerated();
    const filtered = recent.filter(id => id !== trackId);
    filtered.unshift(trackId);
    
    // Keep only the most recent tracks
    const settings = this.getSettings();
    const maxRecent = settings.maxRecentTracks || 50;
    const trimmed = filtered.slice(0, maxRecent);
    
    localStorage.setItem(this.STORAGE_KEYS.RECENTLY_GENERATED, JSON.stringify(trimmed));
  }

  private removeFromRecentlyGenerated(trackId: string): void {
    const recent = this.getRecentlyGenerated();
    const filtered = recent.filter(id => id !== trackId);
    localStorage.setItem(this.STORAGE_KEYS.RECENTLY_GENERATED, JSON.stringify(filtered));
  }

  public getRecentlyGenerated(): string[] {
    try {
      const recentData = localStorage.getItem(this.STORAGE_KEYS.RECENTLY_GENERATED);
      return recentData ? JSON.parse(recentData) : [];
    } catch (error) {
      console.error('Error loading recently generated tracks:', error);
      return [];
    }
  }

  public getRecentlyGeneratedTracks(limit: number = 10): StreamingTrack[] {
    const recentIds = this.getRecentlyGenerated();
    const tracks = this.getAllTracks();
    
    return recentIds
      .map(id => tracks.find(t => t.id === id))
      .filter(Boolean)
      .slice(0, limit) as StreamingTrack[];
  }

  // Client Management
  public createClient(name: string, description?: string): Client {
    const clients = this.getAllClients();
    const newClient: Client = {
      id: `client_${Date.now()}`,
      name,
      description,
      collections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    clients.push(newClient);
    localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    
    console.log(`👥 Client created: ${name}`);
    return newClient;
  }

  public getAllClients(): Client[] {
    try {
      const clientsData = localStorage.getItem(this.STORAGE_KEYS.CLIENTS);
      return clientsData ? JSON.parse(clientsData) : [];
    } catch (error) {
      console.error('Error loading clients from storage:', error);
      return [];
    }
  }

  public getClient(clientId: string): Client | null {
    const clients = this.getAllClients();
    return clients.find(c => c.id === clientId) || null;
  }

  public updateClient(clientId: string, updates: Partial<Client>): boolean {
    const clients = this.getAllClients();
    const index = clients.findIndex(c => c.id === clientId);
    
    if (index >= 0) {
      clients[index] = { ...clients[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      console.log(`👥 Client updated: ${clientId}`);
      return true;
    }
    return false;
  }

  public deleteClient(clientId: string): boolean {
    const clients = this.getAllClients();
    const filtered = clients.filter(c => c.id !== clientId);
    
    if (filtered.length < clients.length) {
      localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(filtered));
      console.log(`🗑️ Client deleted: ${clientId}`);
      return true;
    }
    return false;
  }

  // Collection Management
  public createCollection(clientId: string, name: string, description?: string): TrackCollection | null {
    const client = this.getClient(clientId);
    if (!client) return null;
    
    const newCollection: TrackCollection = {
      id: `collection_${Date.now()}`,
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    client.collections.push(newCollection);
    client.updatedAt = new Date();
    
    this.updateClient(clientId, client);
    console.log(`📁 Collection created: ${name} for client ${client.name}`);
    return newCollection;
  }

  public addTrackToCollection(collectionId: string, trackId: string): boolean {
    const clients = this.getAllClients();
    
    for (const client of clients) {
      const collection = client.collections.find(c => c.id === collectionId);
      if (collection) {
        if (!collection.tracks.includes(trackId)) {
          collection.tracks.push(trackId);
          collection.updatedAt = new Date();
          client.updatedAt = new Date();
          
          this.updateClient(client.id, client);
          console.log(`📁 Track added to collection: ${trackId} -> ${collection.name}`);
          return true;
        }
        break;
      }
    }
    return false;
  }

  public removeTrackFromCollection(collectionId: string, trackId: string): boolean {
    const clients = this.getAllClients();
    
    for (const client of clients) {
      const collection = client.collections.find(c => c.id === collectionId);
      if (collection) {
        const index = collection.tracks.indexOf(trackId);
        if (index >= 0) {
          collection.tracks.splice(index, 1);
          collection.updatedAt = new Date();
          client.updatedAt = new Date();
          
          this.updateClient(client.id, client);
          console.log(`📁 Track removed from collection: ${trackId} <- ${collection.name}`);
          return true;
        }
        break;
      }
    }
    return false;
  }

  // Settings
  public getSettings(): any {
    try {
      const settingsData = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return settingsData ? JSON.parse(settingsData) : {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  public updateSettings(updates: any): void {
    const settings = this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    console.log('⚙️ Settings updated');
  }

  // Export/Import
  public exportData(): string {
    const data = {
      tracks: this.getAllTracks(),
      clients: this.getAllClients(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  public importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.tracks) {
        localStorage.setItem(this.STORAGE_KEYS.TRACKS, JSON.stringify(parsed.tracks));
      }
      if (parsed.clients) {
        localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(parsed.clients));
      }
      if (parsed.settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }
      
      console.log('📥 Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Cleanup
  public clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.TRACKS);
    localStorage.removeItem(this.STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(this.STORAGE_KEYS.RECENTLY_GENERATED);
    localStorage.removeItem(this.STORAGE_KEYS.SETTINGS);
    this.initializeStorage();
    console.log('🗑️ All data cleared');
  }
}

// Export singleton instance
const trackStorageService = new TrackStorageService();
export default trackStorageService;
