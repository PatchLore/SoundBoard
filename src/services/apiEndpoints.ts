import { audioController } from './audioController';
import { obsIntegration } from './obsIntegration';
import { discordBot } from './discordBot';
import { twitchIntegration } from './twitchIntegration';
import { StreamingTrack } from '../types/track';

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  requiresAuth: boolean;
  handler: (req: any, res: any) => Promise<void>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TrackRequest {
  trackId: string;
  crossfade?: boolean;
  volume?: number;
}

export interface VolumeRequest {
  volume: number;
}

export interface DuckingRequest {
  enabled: boolean;
  threshold?: number;
  amount?: number;
}

class APIEndpoints {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private isRunning = false;
  private server: any = null;

  constructor() {
    this.setupEndpoints();
  }

  private setupEndpoints(): void {
    // Audio Control Endpoints
    this.addEndpoint({
      path: '/api/audio/play',
      method: 'POST',
      description: 'Play a track',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const { trackId, crossfade, volume }: TrackRequest = req.body;
          
          if (!trackId) {
            return this.sendResponse(res, 400, { success: false, error: 'Track ID is required' });
          }

          // This would find the track by ID
          const track = await this.findTrackById(trackId);
          if (!track) {
            return this.sendResponse(res, 404, { success: false, error: 'Track not found' });
          }

          if (volume !== undefined) {
            audioController.setVolume(volume);
          }

          await audioController.playTrack(track, crossfade || false);
          
          this.sendResponse(res, 200, {
            success: true,
            data: { message: 'Track started playing', track: track.title }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/audio/pause',
      method: 'POST',
      description: 'Pause current track',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          audioController.pause();
          this.sendResponse(res, 200, {
            success: true,
            data: { message: 'Track paused' }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/audio/resume',
      method: 'POST',
      description: 'Resume current track',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          audioController.resume();
          this.sendResponse(res, 200, {
            success: true,
            data: { message: 'Track resumed' }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/audio/stop',
      method: 'POST',
      description: 'Stop current track',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          audioController.stop();
          this.sendResponse(res, 200, {
            success: true,
            data: { message: 'Track stopped' }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/audio/volume',
      method: 'POST',
      description: 'Set volume',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const { volume }: VolumeRequest = req.body;
          
          if (volume === undefined || volume < 0 || volume > 100) {
            return this.sendResponse(res, 400, { success: false, error: 'Volume must be between 0-100' });
          }

          audioController.setVolume(volume / 100);
          
          this.sendResponse(res, 200, {
            success: true,
            data: { message: 'Volume set', volume }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/audio/volume',
      method: 'GET',
      description: 'Get current volume',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const volume = Math.round(audioController.getVolume() * 100);
          this.sendResponse(res, 200, {
            success: true,
            data: { volume }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/audio/fade',
      method: 'POST',
      description: 'Fade audio in/out',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const { direction, duration } = req.body;
          
          if (!direction || !['in', 'out'].includes(direction)) {
            return this.sendResponse(res, 400, { success: false, error: 'Direction must be "in" or "out"' });
          }

          const fadeDuration = duration || 2;

          if (direction === 'in') {
            audioController.fadeIn(fadeDuration);
          } else {
            audioController.fadeOut(fadeDuration);
          }

          this.sendResponse(res, 200, {
            success: true,
            data: { message: `Fading ${direction}`, duration: fadeDuration }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/audio/ducking',
      method: 'POST',
      description: 'Configure audio ducking',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const { enabled, threshold, amount }: DuckingRequest = req.body;
          
          if (enabled === undefined) {
            return this.sendResponse(res, 400, { success: false, error: 'Enabled state is required' });
          }

          audioController.enableDucking(enabled);
          
          if (threshold !== undefined) {
            audioController.setDuckingThreshold(threshold);
          }
          
          if (amount !== undefined) {
            audioController.setDuckingAmount(amount);
          }

          this.sendResponse(res, 200, {
            success: true,
            data: { message: 'Audio ducking configured', enabled }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/audio/ducking',
      method: 'GET',
      description: 'Get audio ducking status',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const settings = audioController.getSettings();
          this.sendResponse(res, 200, {
            success: true,
            data: {
              enabled: settings.duckingEnabled,
              threshold: settings.duckingThreshold,
              amount: settings.duckingAmount
            }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    // Status Endpoints
    this.addEndpoint({
      path: '/api/status',
      method: 'GET',
      description: 'Get system status',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const currentTrack = audioController.getCurrentTrack();
          const isPlaying = audioController.getIsPlaying();
          const volume = audioController.getVolume();
          const settings = audioController.getSettings();

          this.sendResponse(res, 200, {
            success: true,
            data: {
              audio: {
                isPlaying,
                volume: Math.round(volume * 100),
                currentTrack: currentTrack ? {
                  id: currentTrack.id,
                  title: currentTrack.title,
                  duration: currentTrack.duration
                } : null,
                settings: {
                  duckingEnabled: settings.duckingEnabled,
                  normalizationEnabled: settings.normalizationEnabled,
                  loopEnabled: settings.loopEnabled
                }
              },
              integrations: {
                obs: obsIntegration.isConnected(),
                discord: discordBot.isBotConnected(),
                twitch: twitchIntegration.isTwitchConnected()
              }
            }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    // OBS Integration Endpoints
    this.addEndpoint({
      path: '/api/obs/connect',
      method: 'POST',
      description: 'Connect to OBS',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const { host, port, password } = req.body;
          
          if (host && port) {
            obsIntegration.setConfig({ host, port, password });
          }
          
          const connected = await obsIntegration.connect();
          
          this.sendResponse(res, 200, {
            success: true,
            data: { connected, message: connected ? 'Connected to OBS' : 'Failed to connect to OBS' }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    this.addEndpoint({
      path: '/api/obs/status',
      method: 'GET',
      description: 'Get OBS connection status',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const connection = obsIntegration.getConnection();
          this.sendResponse(res, 200, {
            success: true,
            data: connection
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    // Discord Integration Endpoints
    this.addEndpoint({
      path: '/api/discord/connect',
      method: 'POST',
      description: 'Connect Discord bot',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const { token, clientId, guildId, modRoleId } = req.body;
          
          if (token && clientId && guildId) {
            discordBot.setConfig({ token, clientId, guildId, modRoleId, enabled: true });
          }
          
          const connected = await discordBot.connect();
          
          this.sendResponse(res, 200, {
            success: true,
            data: { connected, message: connected ? 'Discord bot connected' : 'Failed to connect Discord bot' }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    // Twitch Integration Endpoints
    this.addEndpoint({
      path: '/api/twitch/connect',
      method: 'POST',
      description: 'Connect to Twitch',
      requiresAuth: false,
      handler: async (req, res) => {
        try {
          const { username, oauth, channel } = req.body;
          
          if (username && oauth && channel) {
            twitchIntegration.setConfig({ username, oauth, channel, enabled: true });
          }
          
          const connected = await twitchIntegration.connect();
          
          this.sendResponse(res, 200, {
            success: true,
            data: { connected, message: connected ? 'Connected to Twitch' : 'Failed to connect to Twitch' }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.sendResponse(res, 500, { success: false, error: errorMessage });
        }
      }
    });

    // Health Check Endpoint
    this.addEndpoint({
      path: '/api/health',
      method: 'GET',
      description: 'Health check endpoint',
      requiresAuth: false,
      handler: async (req, res) => {
        this.sendResponse(res, 200, {
          success: true,
          data: { 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      }
    });
  }

  private addEndpoint(endpoint: APIEndpoint): void {
    this.endpoints.set(endpoint.path, endpoint);
  }

  private async findTrackById(trackId: string): Promise<StreamingTrack | null> {
    // This would search your track library by ID
    // For now, return null to indicate no track found
    return null;
  }

  private sendResponse(res: any, status: number, data: APIResponse): void {
    res.status(status).json({
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Get all available endpoints
  getEndpoints(): Map<string, APIEndpoint> {
    return new Map(this.endpoints);
  }

  // Get endpoint documentation
  getDocumentation(): any[] {
    return Array.from(this.endpoints.values()).map(endpoint => ({
      path: endpoint.path,
      method: endpoint.method,
      description: endpoint.description,
      requiresAuth: endpoint.requiresAuth
    }));
  }

  // Start the API server
  async startServer(port: number = 3001): Promise<void> {
    if (this.isRunning) return;

    try {
      // This would start an Express.js server
      // For now, we'll simulate it
      this.isRunning = true;
      console.log(`API server started on port ${port}`);
      console.log('Available endpoints:');
      
      this.endpoints.forEach((endpoint, path) => {
        console.log(`  ${endpoint.method} ${path} - ${endpoint.description}`);
      });
    } catch (error) {
      console.error('Failed to start API server:', error);
      this.isRunning = false;
    }
  }

  // Stop the API server
  stopServer(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    console.log('API server stopped');
  }

  // Check if server is running
  isServerRunning(): boolean {
    return this.isRunning;
  }

  // Cleanup
  destroy(): void {
    this.stopServer();
    this.endpoints.clear();
  }
}

// Export singleton instance
export const apiEndpoints = new APIEndpoints();
