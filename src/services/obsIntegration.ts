// import { audioController } from './audioController';
// import { StreamingTrack } from '../types/track';

export interface OBSConnection {
  isConnected: boolean;
  version: string;
  sceneName: string;
  isStreaming: boolean;
  isRecording: boolean;
}

export interface OBSCommand {
  command: string;
  params?: any;
  response?: any;
}

export interface OBSPluginConfig {
  host: string;
  port: number;
  password?: string;
  autoConnect: boolean;
  reconnectInterval: number;
}

class OBSIntegration {
  private ws: WebSocket | null = null;
  private connection: OBSConnection = {
    isConnected: false,
    version: '',
    sceneName: '',
    isStreaming: false,
    isRecording: false
  };
  private config: OBSPluginConfig = {
    host: 'localhost',
    port: 4455,
    password: '',
    autoConnect: false,
    reconnectInterval: 5000
  };
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageId = 0;
  private pendingRequests = new Map<number, { resolve: Function; reject: Function }>();

  // Configuration
  setConfig(config: Partial<OBSPluginConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.config.autoConnect && !this.connection.isConnected) {
      this.connect();
    }
  }

  getConfig(): OBSPluginConfig {
    return { ...this.config };
  }

  // Connection Management
  async connect(): Promise<boolean> {
    try {
      const url = `ws://${this.config.host}:${this.config.port}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('OBS WebSocket connected');
        this.connection.isConnected = true;
        this.authenticate();
        this.getOBSInfo();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('OBS WebSocket disconnected');
        this.connection.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('OBS WebSocket error:', error);
        this.connection.isConnected = false;
      };

      return true;
    } catch (error) {
      console.error('Failed to connect to OBS:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.connection.isConnected = false;
  }

  private scheduleReconnect(): void {
    if (this.config.autoConnect && this.reconnectTimer === null) {
      this.reconnectTimer = setTimeout(() => {
        this.connect();
        this.reconnectTimer = null;
      }, this.config.reconnectInterval);
    }
  }

  // Authentication
  private async authenticate(): Promise<void> {
    if (!this.config.password) return;

    try {
      const response = await this.sendCommand('GetAuthRequired');
      if (response.authRequired) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const auth = await this.sendCommand('Authenticate', {
          auth: response.salt,
          challenge: response.challenge
        });
        console.log('OBS authenticated successfully');
      }
    } catch (error) {
      console.error('OBS authentication failed:', error);
    }
  }

  // Command System
  private async sendCommand(command: string, params?: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('OBS WebSocket not connected');
    }

    const id = ++this.messageId;
    const message = {
      requestType: command,
      requestId: id,
      ...(params && { requestData: params })
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(message));
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`OBS command timeout: ${command}`));
        }
      }, 10000);
    });
  }

  private handleMessage(data: any): void {
    if (data.requestId && this.pendingRequests.has(data.requestId)) {
      const { resolve, reject } = this.pendingRequests.get(data.requestId)!;
      this.pendingRequests.delete(data.requestId);

      if (data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data.responseData || data);
      }
    } else if (data.updateType) {
      this.handleUpdate(data);
    }
  }

  private handleUpdate(data: any): void {
    switch (data.updateType) {
      case 'SceneTransitionStarted':
        this.connection.sceneName = data.sceneName;
        this.emit('sceneChanged', data.sceneName);
        break;
      case 'StreamStarting':
        this.connection.isStreaming = true;
        this.emit('streamStarted');
        break;
      case 'StreamStopped':
        this.connection.isStreaming = false;
        this.emit('streamStopped');
        break;
      case 'RecordingStarting':
        this.connection.isRecording = true;
        this.emit('recordingStarted');
        break;
      case 'RecordingStopped':
        this.connection.isRecording = false;
        this.emit('recordingStopped');
        break;
    }
  }

  // OBS Information
  private async getOBSInfo(): Promise<void> {
    try {
      const info = await this.sendCommand('GetVersion');
      this.connection.version = info.obsVersion;
      
      const scene = await this.sendCommand('GetCurrentProgramScene');
      this.connection.sceneName = scene.currentProgramSceneName;
      
      const streamStatus = await this.sendCommand('GetStreamStatus');
      this.connection.isStreaming = streamStatus.outputActive;
      
      const recordStatus = await this.sendCommand('GetRecordStatus');
      this.connection.isRecording = recordStatus.outputActive;
    } catch (error) {
      console.error('Failed to get OBS info:', error);
    }
  }

  // Scene Management
  async getScenes(): Promise<string[]> {
    try {
      const response = await this.sendCommand('GetSceneList');
      return response.scenes.map((scene: any) => scene.sceneName);
    } catch (error) {
      console.error('Failed to get scenes:', error);
      return [];
    }
  }

  async switchScene(sceneName: string): Promise<void> {
    try {
      await this.sendCommand('SetCurrentProgramScene', { sceneName });
      this.connection.sceneName = sceneName;
    } catch (error) {
      console.error('Failed to switch scene:', error);
      throw error;
    }
  }

  // Source Management
  async getSources(): Promise<any[]> {
    try {
      const response = await this.sendCommand('GetSceneList');
      return response.scenes.flatMap((scene: any) => 
        scene.sources.map((source: any) => ({
          ...source,
          sceneName: scene.sceneName
        }))
      );
    } catch (error) {
      console.error('Failed to get sources:', error);
      return [];
    }
  }

  async toggleSource(sourceName: string, sceneName?: string): Promise<void> {
    try {
      const scene = sceneName || this.connection.sceneName;
      await this.sendCommand('ToggleSourceVisibility', { sourceName, sceneName: scene });
    } catch (error) {
      console.error('Failed to toggle source:', error);
      throw error;
    }
  }

  // Audio Integration
  async setSourceVolume(sourceName: string, volume: number): Promise<void> {
    try {
      await this.sendCommand('SetInputVolume', { 
        inputName: sourceName, 
        inputVolumeMul: volume 
      });
    } catch (error) {
      console.error('Failed to set source volume:', error);
      throw error;
    }
  }

  async getSourceVolume(sourceName: string): Promise<number> {
    try {
      const response = await this.sendCommand('GetInputVolume', { inputName: sourceName });
      return response.inputVolumeMul;
    } catch (error) {
      console.error('Failed to get source volume:', error);
      return 1.0;
    }
  }

  // Streamlabs Integration
  async triggerStreamlabsAlert(alertType: string, message: string): Promise<void> {
    try {
      // This would integrate with Streamlabs API
      // For now, we'll create a custom source in OBS
      await this.sendCommand('TriggerSourceFilter', {
        sourceName: 'Streamlabs Alerts',
        filterName: alertType,
        filterSettings: { message }
      });
    } catch (error) {
      console.error('Failed to trigger Streamlabs alert:', error);
    }
  }

  // Browser Source Integration
  async createBrowserSource(name: string, url: string, width: number = 1920, height: number = 1080): Promise<void> {
    try {
      await this.sendCommand('CreateInput', {
        sceneName: this.connection.sceneName,
        inputName: name,
        inputKind: 'browser_source',
        inputSettings: {
          url,
          width,
          height
        }
      });
    } catch (error) {
      console.error('Failed to create browser source:', error);
      throw error;
    }
  }

  // Event System
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(...args));
    }
  }

  // Getters
  getConnection(): OBSConnection {
    return { ...this.connection };
  }

  isConnected(): boolean {
    return this.connection.isConnected;
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.listeners.clear();
  }
}

// Export singleton instance
export const obsIntegration = new OBSIntegration();
