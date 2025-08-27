import { StreamingTrack } from '../types/track';
import trackStorageService from './trackStorageService';

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

export interface AudioState {
  currentTrack: StreamingTrack | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  loopCount: number;
}

export interface AudioEventCallbacks {
  onTrackChange?: (track: StreamingTrack | null) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onVolumeChange?: (volume: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onTrackEnd?: (track: StreamingTrack) => void;
  onError?: (error: string) => void;
  onFadeStart?: (type: 'in' | 'out', duration: number) => void;
  onFadeComplete?: (type: 'in' | 'out') => void;
}

class UnifiedAudioController {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrack: StreamingTrack | null = null;
  private isPlaying: boolean = false;
  private volume: number = 50;
  private currentTime: number = 0;
  private duration: number = 0;
  private eventCallbacks: AudioEventCallbacks = {};
  private stopListeners: Map<string, () => void> = new Map();
  private fadeInterval: number | null = null;
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
  private currentLoopCount: number = 0;

  constructor() {
    this.initializeAudioElement();
  }

  private initializeAudioElement() {
    // Create hidden audio element
    this.audioElement = document.createElement('audio');
    this.audioElement.style.display = 'none';
    this.audioElement.preload = 'metadata';
    
    // Set up event listeners
    this.audioElement.addEventListener('loadedmetadata', this.handleLoadedMetadata.bind(this));
    this.audioElement.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
    this.audioElement.addEventListener('ended', this.handleEnded.bind(this));
    this.audioElement.addEventListener('error', this.handleError.bind(this));
    this.audioElement.addEventListener('play', this.handlePlay.bind(this));
    this.audioElement.addEventListener('pause', this.handlePause.bind(this));
    
    // Add to DOM
    document.body.appendChild(this.audioElement);
    
    // Set initial volume
    this.setVolume(this.volume);
  }

  // Public methods
  public async playTrack(track: StreamingTrack, crossfade: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audioElement) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      // Determine audio source
      const audioSrc = this.getAudioSource(track);
      if (!audioSrc) {
        reject(new Error('Track has no valid audio source'));
        return;
      }

      try {
        // Handle crossfade if enabled
        if (crossfade && this.isPlaying && this.currentTrack) {
          this.crossfadeToTrack(track, audioSrc, resolve, reject);
        } else {
          // Stop current track and play new one
          if (this.isPlaying) {
            this.stopCurrentTrack();
          }
          this.playNewTrack(track, audioSrc, resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private getAudioSource(track: StreamingTrack): string | null {
    // Priority: audioUrl (Suno), then fallback to tracks directory
    if (track.audioUrl) {
      return track.audioUrl;
    }
    
    // Fallback to tracks directory based on title
    if (track.title) {
      // Try to match with existing track files
      const trackTitle = track.title.toLowerCase().replace(/\s+/g, '');
      return `/tracks/${trackTitle}.mp3`;
    }
    
    return null;
  }

  private async playNewTrack(track: StreamingTrack, audioSrc: string, resolve: Function, reject: Function) {
    try {
      // Set new track
      this.currentTrack = track;
      this.audioElement!.src = audioSrc;
      this.audioElement!.load();

      // Reset loop counter
      this.currentLoopCount = 0;

      // Play the track
      await this.audioElement!.play();
      
      this.isPlaying = true;
      this.notifyEventCallbacks('onPlayStateChange', this.isPlaying);
      this.notifyEventCallbacks('onTrackChange', this.currentTrack);
      
      // Start fade in if enabled
      if (this.settings.fadeInDuration > 0) {
        this.fadeIn(this.settings.fadeInDuration);
      }

      // Update usage tracking
      this.updateUsageTracking(track);
      
      resolve();
    } catch (error) {
      reject(error);
    }
  }

  private async crossfadeToTrack(track: StreamingTrack, audioSrc: string, resolve: Function, reject: Function) {
    try {
      // Create temporary audio element for crossfade
      const tempAudio = document.createElement('audio');
      tempAudio.src = audioSrc;
      tempAudio.volume = 0;
      tempAudio.preload = 'metadata';
      
      // Wait for metadata to load
      await new Promise<void>((metadataResolve) => {
        tempAudio.addEventListener('loadedmetadata', () => metadataResolve());
        tempAudio.load();
      });

      // Start fade out of current track
      this.fadeOut(this.settings.crossfadeDuration);
      
      // Start fade in of new track
      tempAudio.volume = 0;
      await tempAudio.play();
      
      // Fade in new track
      this.fadeInElement(tempAudio, this.settings.crossfadeDuration);
      
      // After crossfade duration, switch to new track
      setTimeout(() => {
        // Update current track
        this.currentTrack = track;
        this.audioElement!.src = audioSrc;
        this.audioElement!.load();
        this.audioElement!.volume = this.volume / 100;
        
        // Remove temp audio
        tempAudio.remove();
        
        // Update usage tracking
        this.updateUsageTracking(track);
        
        resolve();
      }, this.settings.crossfadeDuration * 1000);
      
    } catch (error) {
      reject(error);
    }
  }

  public pause(): void {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.notifyEventCallbacks('onPlayStateChange', this.isPlaying);
    }
  }

  public resume(): void {
    if (this.audioElement && !this.isPlaying && this.currentTrack) {
      this.audioElement.play().then(() => {
        this.isPlaying = true;
        this.notifyEventCallbacks('onPlayStateChange', this.isPlaying);
      }).catch((error) => {
        this.notifyEventCallbacks('onError', `Failed to resume: ${error.message}`);
      });
    }
  }

  public stop(): void {
    this.stopCurrentTrack();
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume));
    this.settings.volume = this.volume / 100;
    
    if (this.audioElement) {
      this.audioElement.volume = this.settings.volume;
    }
    
    this.notifyEventCallbacks('onVolumeChange', this.volume);
  }

  public getVolume(): number {
    return this.volume;
  }

  public seekTo(time: number): void {
    if (this.audioElement && this.currentTrack) {
      this.audioElement.currentTime = Math.max(0, Math.min(time, this.duration));
    }
  }

  public getCurrentState(): AudioState {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      volume: this.volume,
      currentTime: this.currentTime,
      duration: this.duration,
      isLooping: this.settings.loopEnabled,
      loopCount: this.currentLoopCount
    };
  }

  public getCurrentTrack(): StreamingTrack | null {
    return this.currentTrack;
  }

  public isTrackPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration;
  }

  // Fade effects
  public fadeIn(duration: number): void {
    if (!this.audioElement) return;
    
    this.notifyEventCallbacks('onFadeStart', 'in', duration);
    
    const startVolume = 0;
    const endVolume = this.settings.volume;
    const steps = 60; // 60fps
    const stepDuration = duration / steps;
    const volumeStep = (endVolume - startVolume) / steps;
    
    let currentStep = 0;
    this.audioElement.volume = startVolume;
    
    this.fadeInterval = window.setInterval(() => {
      currentStep++;
      this.audioElement!.volume = startVolume + (volumeStep * currentStep);
      
      if (currentStep >= steps) {
        this.audioElement!.volume = endVolume;
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        this.notifyEventCallbacks('onFadeComplete', 'in');
      }
    }, stepDuration * 1000);
  }

  public fadeOut(duration: number): void {
    if (!this.audioElement) return;
    
    this.notifyEventCallbacks('onFadeStart', 'out', duration);
    
    const startVolume = this.audioElement.volume;
    const endVolume = 0;
    const steps = 60; // 60fps
    const stepDuration = duration / steps;
    const volumeStep = (startVolume - endVolume) / steps;
    
    let currentStep = 0;
    
    this.fadeInterval = window.setInterval(() => {
      currentStep++;
      this.audioElement!.volume = startVolume - (volumeStep * currentStep);
      
      if (currentStep >= steps) {
        this.audioElement!.volume = endVolume;
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        this.notifyEventCallbacks('onFadeComplete', 'out');
      }
    }, stepDuration * 1000);
  }

  private fadeInElement(audioElement: HTMLAudioElement, duration: number): void {
    const startVolume = 0;
    const endVolume = this.settings.volume;
    const steps = 60;
    const stepDuration = duration / steps;
    const volumeStep = (endVolume - startVolume) / steps;
    
    let currentStep = 0;
    audioElement.volume = startVolume;
    
    const interval = window.setInterval(() => {
      currentStep++;
      audioElement.volume = startVolume + (volumeStep * currentStep);
      
      if (currentStep >= steps) {
        audioElement.volume = endVolume;
        clearInterval(interval);
      }
    }, stepDuration * 1000);
  }

  // Loop functionality
  public setLooping(enabled: boolean, count: number = -1): void {
    this.settings.loopEnabled = enabled;
    this.settings.loopCount = count;
    
    if (this.audioElement) {
      this.audioElement.loop = enabled && count === -1; // HTML5 audio only supports infinite loops
    }
  }

  public getLoopSettings(): { enabled: boolean; count: number } {
    return {
      enabled: this.settings.loopEnabled,
      count: this.settings.loopCount
    };
  }

  // Settings management
  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    // Apply volume setting immediately
    if (newSettings.volume !== undefined) {
      this.setVolume(newSettings.volume * 100);
    }
    
    // Apply loop setting immediately
    if (newSettings.loopEnabled !== undefined || newSettings.loopCount !== undefined) {
      this.setLooping(
        newSettings.loopEnabled ?? this.settings.loopEnabled,
        newSettings.loopCount ?? this.settings.loopCount
      );
    }
  }

  // Event handling
  public on(event: keyof AudioEventCallbacks, callback: any): void {
    this.eventCallbacks[event] = callback;
  }

  public off(event: keyof AudioEventCallbacks): void {
    delete this.eventCallbacks[event];
  }

  // Stop listener management (for compatibility with existing code)
  public registerStopListener(trackId: string, callback: () => void): void {
    this.stopListeners.set(trackId, callback);
  }

  public unregisterStopListener(trackId: string): void {
    this.stopListeners.delete(trackId);
  }

  // Usage tracking
  private updateUsageTracking(track: StreamingTrack): void {
    try {
      const updatedTrack = {
        ...track,
        usageTracking: {
          ...(track.usageTracking || { usageCount: 0 }),
          usageCount: ((track.usageTracking && track.usageTracking.usageCount) ? track.usageTracking.usageCount : 0) + 1,
          lastUsed: new Date()
        }
      };
      
      // Save to storage
      trackStorageService.saveTrack(updatedTrack);
      
      // Update current track reference
      this.currentTrack = updatedTrack;
    } catch (error) {
      console.error('Error updating usage tracking:', error);
    }
  }

  // Private methods
  private stopCurrentTrack(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    
    this.isPlaying = false;
    this.currentTime = 0;
    
    // Clear any active fade
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    
    // Notify all stop listeners
    this.stopListeners.forEach(callback => callback());
    
    this.notifyEventCallbacks('onPlayStateChange', this.isPlaying);
  }

  private handleLoadedMetadata(): void {
    if (this.audioElement) {
      this.duration = this.audioElement.duration;
    }
  }

  private handleTimeUpdate(): void {
    if (this.audioElement) {
      this.currentTime = this.audioElement.currentTime;
      this.notifyEventCallbacks('onTimeUpdate', this.currentTime);
    }
  }

  private handleEnded(): void {
    if (this.currentTrack) {
      this.notifyEventCallbacks('onTrackEnd', this.currentTrack);
      
      // Handle looping
      if (this.settings.loopEnabled) {
        if (this.settings.loopCount === -1 || this.currentLoopCount < this.settings.loopCount) {
          this.currentLoopCount++;
          if (this.audioElement) {
            this.audioElement.currentTime = 0;
            this.audioElement.play().catch(console.error);
          }
          return;
        }
      }
    }
    
    this.isPlaying = false;
    this.currentTime = 0;
    this.currentLoopCount = 0;
    this.notifyEventCallbacks('onPlayStateChange', this.isPlaying);
  }

  private handleError(): void {
    const errorMessage = this.audioElement?.error?.message || 'Unknown audio error';
    this.notifyEventCallbacks('onError', errorMessage);
    this.isPlaying = false;
    this.notifyEventCallbacks('onPlayStateChange', this.isPlaying);
  }

  private handlePlay(): void {
    this.isPlaying = true;
    this.notifyEventCallbacks('onPlayStateChange', this.isPlaying);
  }

  private handlePause(): void {
    this.isPlaying = false;
    this.notifyEventCallbacks('onPlayStateChange', this.isPlaying);
  }

  private notifyEventCallbacks(event: keyof AudioEventCallbacks, ...args: any[]): void {
    const callback = this.eventCallbacks[event];
    if (callback) {
      try {
        (callback as Function)(...args);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.remove();
      this.audioElement = null;
    }
    
    this.stopListeners.clear();
    this.eventCallbacks = {};
  }
}

// Export singleton instance
const unifiedAudioController = new UnifiedAudioController();
export default unifiedAudioController;
export { UnifiedAudioController };
