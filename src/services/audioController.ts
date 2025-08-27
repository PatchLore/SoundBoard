import { StreamingTrack } from '../types/track';

export interface AudioSettings {
  volume: number;
  fadeInDuration: number; // in seconds
  fadeOutDuration: number; // in seconds
  crossfadeDuration: number; // in seconds
  duckingEnabled: boolean;
  duckingThreshold: number; // dB threshold for ducking
  duckingAmount: number; // how much to reduce volume (0-1)
  normalizationEnabled: boolean;
  loopEnabled: boolean;
  loopCount: number; // -1 for infinite
}

export interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: 'play' | 'pause' | 'next' | 'previous' | 'volume_up' | 'volume_down' | 'mute' | 'duck';
  trackId?: string;
}

// Audio controller service to manage track playback
class AudioController {
  private currentPlayingTrackId: string | null = null;
  private listeners: Map<string, () => void> = new Map();
  private volume: number = 0.5;
  private isPlaying: boolean = false;
  private settings: AudioSettings = {
    volume: 0.5,
    fadeInDuration: 2,
    fadeOutDuration: 2,
    crossfadeDuration: 1,
    duckingEnabled: false,
    duckingThreshold: -20,
    duckingAmount: 0.5,
    normalizationEnabled: false,
    loopEnabled: false,
    loopCount: 1
  };
  private hotkeys: Map<string, HotkeyConfig> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  // Set the currently playing track
  setPlayingTrack(trackId: string) {
    console.log('🎵 AudioController: Setting playing track to:', trackId);
    
    // Stop any previously playing track (but not the current one)
    if (this.currentPlayingTrackId && this.currentPlayingTrackId !== trackId) {
      console.log('🎵 AudioController: Stopping previous track:', this.currentPlayingTrackId);
      this.stopTrack(this.currentPlayingTrackId);
    }
    
    this.currentPlayingTrackId = trackId;
    this.isPlaying = true;
    this.emit('trackStarted', trackId);
    console.log('🎵 AudioController: Now playing track:', trackId);
  }

  // Stop a specific track
  stopTrack(trackId: string) {
    console.log('🎵 AudioController: Stop track called for:', trackId);
    
    // Only stop if this is the currently playing track
    if (this.currentPlayingTrackId === trackId) {
      console.log('🎵 AudioController: Stopping currently playing track:', trackId);
      this.currentPlayingTrackId = null;
      this.isPlaying = false;
      
      // Notify listeners that this track should stop
      const listener = this.listeners.get(trackId);
      if (listener) {
        listener();
      }
    } else {
      console.log('🎵 AudioController: Track not currently playing, ignoring stop:', trackId);
    }
    
    console.log('🎵 AudioController: Stop track completed for:', trackId);
  }

  // Stop all tracks
  stopAllTracks() {
    this.currentPlayingTrackId = null;
    this.isPlaying = false;
    this.listeners.forEach(listener => listener());
    this.emit('stopped');
    console.log('🎵 Stopped all tracks');
  }

  // Get currently playing track
  getCurrentPlayingTrack(): string | null {
    return this.currentPlayingTrackId;
  }

  // Register a stop listener for a track
  registerStopListener(trackId: string, callback: () => void) {
    this.listeners.set(trackId, callback);
  }

  // Unregister a stop listener
  unregisterStopListener(trackId: string) {
    this.listeners.delete(trackId);
  }

  // Check if a track is currently playing
  isTrackPlaying(trackId: string): boolean {
    return this.currentPlayingTrackId === trackId;
  }

  // Volume control
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.settings.volume = this.volume;
    this.emit('volumeChanged', this.volume);
    console.log('🔊 Volume set to:', this.volume);
  }

  getVolume(): number {
    return this.volume;
  }

  // Playback control
  pause() {
    this.isPlaying = false;
    this.emit('paused');
    console.log('⏸️ Audio paused');
  }

  resume() {
    this.isPlaying = true;
    this.emit('resumed');
    console.log('▶️ Audio resumed');
  }

  stop() {
    this.stopAllTracks();
  }

  // Track playback
  async playTrack(track: StreamingTrack, crossfade: boolean = false) {
    this.setPlayingTrack(track.id);
    console.log('🎵 Playing track:', track.title, 'crossfade:', crossfade);
  }

  // Fade effects
  fadeIn(duration: number) {
    console.log('🔊 Fading in over', duration, 'seconds');
    this.emit('fadeIn', duration);
  }

  fadeOut(duration: number) {
    console.log('🔊 Fading out over', duration, 'seconds');
    this.emit('fadeOut', duration);
  }

  // Settings management
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  enableDucking(enabled: boolean) {
    this.settings.duckingEnabled = enabled;
    console.log('🔊 Ducking enabled:', enabled);
  }

  setDuckingThreshold(threshold: number) {
    this.settings.duckingThreshold = threshold;
    console.log('🔊 Ducking threshold set to:', threshold);
  }

  setDuckingAmount(amount: number) {
    this.settings.duckingAmount = amount;
    console.log('🔊 Ducking amount set to:', amount);
  }

  enableNormalization(enabled: boolean) {
    this.settings.normalizationEnabled = enabled;
    console.log('🔊 Normalization enabled:', enabled);
  }

  setLooping(enabled: boolean, count: number) {
    this.settings.loopEnabled = enabled;
    this.settings.loopCount = count;
    console.log('🔊 Looping set to:', enabled, 'count:', count);
  }

  // Hotkey management
  getHotkeys(): Map<string, HotkeyConfig> {
    return new Map(this.hotkeys);
  }

  addHotkey(config: HotkeyConfig) {
    this.hotkeys.set(config.key, config);
    console.log('⌨️ Hotkey added:', config);
  }

  removeHotkey(key: string) {
    this.hotkeys.delete(key);
    console.log('⌨️ Hotkey removed:', key);
  }

  enableHotkeys(enabled: boolean) {
    console.log('⌨️ Hotkeys enabled:', enabled);
  }

  // Status methods
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTrack(): StreamingTrack | null {
    // This would need to be implemented to return the actual track object
    return null;
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(...args));
    }
  }
}

// Create singleton instance
export const audioController = new AudioController();
export default audioController;
