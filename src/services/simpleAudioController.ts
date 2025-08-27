class SimpleAudioController {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private volume: number = 0.8;
  private isLooping: boolean = false;
  private currentTrack: any = null;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML5 Audio');
    }
  }

  async playTrack(track: any, crossfade: boolean = false): Promise<void> {
    try {
      // Stop current audio if playing
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      // Create new audio element
      this.currentAudio = new Audio(track.audioUrl);
      this.currentAudio.volume = this.volume;
      this.currentAudio.loop = this.isLooping;
      this.currentTrack = track;

      // Set up event listeners
      this.currentAudio.addEventListener('ended', () => {
        if (!this.isLooping) {
          this.currentTrack = null;
        }
      });

      this.currentAudio.addEventListener('error', (error) => {
        console.error('Audio playback error:', error);
        this.currentTrack = null;
      });

      // Play the audio
      await this.currentAudio.play();
      
      console.log(`🎵 Now playing: ${track.title}`);
    } catch (error) {
      console.error('Failed to play track:', error);
      throw error;
    }
  }

  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play().catch(console.error);
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.currentTrack = null;
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  setLooping(looping: boolean): void {
    this.isLooping = looping;
    if (this.currentAudio) {
      this.currentAudio.loop = looping;
    }
  }

  getLooping(): boolean {
    return this.isLooping;
  }

  getCurrentTrack(): any {
    return this.currentTrack;
  }

  isPlaying(): boolean {
    return this.currentAudio ? !this.currentAudio.paused : false;
  }

  getCurrentTime(): number {
    return this.currentAudio ? this.currentAudio.currentTime : 0;
  }

  getDuration(): number {
    return this.currentAudio ? this.currentAudio.duration : 0;
  }

  seekTo(time: number): void {
    if (this.currentAudio && !isNaN(time)) {
      this.currentAudio.currentTime = time;
    }
  }

  // Crossfade functionality
  async crossfadeTo(newTrack: any, fadeTime: number = 2): Promise<void> {
    if (!this.currentAudio) {
      return this.playTrack(newTrack);
    }

    try {
      // Create new audio element
      const newAudio = new Audio(newTrack.audioUrl);
      newAudio.volume = 0;
      newAudio.loop = this.isLooping;
      
      // Start playing new track
      await newAudio.play();
      
      // Fade out current track
      const fadeOutInterval = setInterval(() => {
        if (this.currentAudio && this.currentAudio.volume > 0) {
          this.currentAudio.volume = Math.max(0, this.currentAudio.volume - 0.1);
        }
      }, (fadeTime * 1000) / 10);

      // Fade in new track
      const fadeInInterval = setInterval(() => {
        if (newAudio.volume < this.volume) {
          newAudio.volume = Math.min(this.volume, newAudio.volume + 0.1);
        }
      }, (fadeTime * 1000) / 10);

      // Complete transition after fade time
      setTimeout(() => {
        clearInterval(fadeOutInterval);
        clearInterval(fadeInInterval);
        
        // Stop old audio
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio = null;
        }
        
        // Set new audio as current
        this.currentAudio = newAudio;
        this.currentTrack = newTrack;
        this.currentAudio.volume = this.volume;
        
        console.log(`🔄 Crossfaded to: ${newTrack.title}`);
      }, fadeTime * 1000);

    } catch (error) {
      console.error('Crossfade failed:', error);
      // Fallback to normal play
      this.playTrack(newTrack);
    }
  }

  // Fade in/out effects
  fadeIn(duration: number = 2): void {
    if (!this.currentAudio) return;
    
    this.currentAudio.volume = 0;
    const targetVolume = this.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      if (this.currentAudio) {
        this.currentAudio.volume = Math.min(targetVolume, currentStep * volumeStep);
      }
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        if (this.currentAudio) {
          this.currentAudio.volume = targetVolume;
        }
      }
    }, stepDuration * 1000);
  }

  fadeOut(duration: number = 2): void {
    if (!this.currentAudio) return;
    
    const startVolume = this.currentAudio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      if (this.currentAudio) {
        this.currentAudio.volume = Math.max(0, startVolume - (currentStep * volumeStep));
      }
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        this.pause();
        if (this.currentAudio) {
          this.currentAudio.volume = startVolume;
        }
      }
    }, stepDuration * 1000);
  }

  // Utility methods
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  destroy(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default new SimpleAudioController();
