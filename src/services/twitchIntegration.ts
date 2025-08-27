import { audioController } from './audioController';

export interface TwitchConfig {
  username: string;
  oauth: string;
  channel: string;
  enabled: boolean;
  modCommands: boolean;
  viewerCommands: boolean;
  cooldown: number;
}

export interface TwitchCommand {
  name: string;
  description: string;
  usage: string;
  modOnly: boolean;
  cooldown: number;
  execute: (user: TwitchUser, args: string[]) => Promise<void>;
}

export interface TwitchUser {
  username: string;
  isModerator: boolean;
  isSubscriber: boolean;
  isVip: boolean;
  isBroadcaster: boolean;
}

class TwitchIntegration {
  private config: TwitchConfig = {
    username: '',
    oauth: '',
    channel: '',
    enabled: false,
    modCommands: true,
    viewerCommands: true,
    cooldown: 30
  };
  private commands: Map<string, TwitchCommand> = new Map();
  private isConnected = false;
  private cooldowns = new Map<string, number>();

  constructor() {
    this.setupCommands();
  }

  setConfig(config: Partial<TwitchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): TwitchConfig {
    return { ...this.config };
  }

  private setupCommands(): void {
    // Sound request command
    this.addCommand({
      name: 'sound',
      description: 'Request a sound to play',
      usage: '!sound <sound name>',
      modOnly: false,
      cooldown: 60,
      execute: async (user, args) => {
        if (args.length === 0) {
          console.log(`@${user.username} Usage: !sound <sound name>`);
          return;
        }
        const soundName = args.join(' ');
        console.log(`@${user.username} Sound request: ${soundName}`);
      }
    });

    // Play command for mods
    this.addCommand({
      name: 'play',
      description: 'Play a track immediately (mod only)',
      usage: '!play <track name>',
      modOnly: true,
      cooldown: 10,
      execute: async (user, args) => {
        if (args.length === 0) {
          console.log(`@${user.username} Usage: !play <track name>`);
          return;
        }
        const trackName = args.join(' ');
        console.log(`@${user.username} Playing: ${trackName}`);
      }
    });

    // Stop command for mods
    this.addCommand({
      name: 'stop',
      description: 'Stop current music (mod only)',
      usage: '!stop',
      modOnly: true,
      cooldown: 5,
      execute: async (user) => {
        audioController.stop();
        console.log(`@${user.username} Music stopped!`);
      }
    });

    // Volume command for mods
    this.addCommand({
      name: 'volume',
      description: 'Set volume (mod only)',
      usage: '!volume <0-100>',
      modOnly: true,
      cooldown: 10,
      execute: async (user, args) => {
        if (args.length === 0) {
          const currentVolume = Math.round(audioController.getVolume() * 100);
          console.log(`@${user.username} Current volume: ${currentVolume}%`);
          return;
        }

        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 0 || volume > 100) {
          console.log(`@${user.username} Volume must be between 0-100`);
          return;
        }

        audioController.setVolume(volume / 100);
        console.log(`@${user.username} Volume set to ${volume}%`);
      }
    });

    // Help command
    this.addCommand({
      name: 'help',
      description: 'Show available commands',
      usage: '!help',
      modOnly: false,
      cooldown: 30,
      execute: async (user) => {
        const availableCommands = Array.from(this.commands.values())
          .filter(cmd => !cmd.modOnly || user.isModerator)
          .map(cmd => `${cmd.name} - ${cmd.description}`)
          .join(', ');
        console.log(`@${user.username} Available commands: ${availableCommands}`);
      }
    });
  }

  private addCommand(command: TwitchCommand): void {
    this.commands.set(command.name.toLowerCase(), command);
  }

  async executeCommand(user: TwitchUser, message: string): Promise<void> {
    if (!message.startsWith('!')) return;

    const args = message.slice(1).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName || !this.commands.has(commandName)) return;

    const command = this.commands.get(commandName)!;
    
    if (command.modOnly && !user.isModerator && !user.isBroadcaster) {
      console.log(`@${user.username} This command is moderator-only`);
      return;
    }

    try {
      await command.execute(user, args);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
    }
  }

  async handleMessage(user: TwitchUser, message: string): Promise<void> {
    if (message.startsWith('!')) {
      await this.executeCommand(user, message);
    }
  }

  async connect(): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('Twitch integration disabled');
      return false;
    }

    this.isConnected = true;
    console.log('Twitch integration connected');
    return true;
  }

  disconnect(): void {
    this.isConnected = false;
    console.log('Twitch integration disconnected');
  }

  isTwitchConnected(): boolean {
    return this.isConnected;
  }

  getCommands(): Map<string, TwitchCommand> {
    return new Map(this.commands);
  }

  destroy(): void {
    this.disconnect();
    this.commands.clear();
    this.cooldowns.clear();
  }
}

export const twitchIntegration = new TwitchIntegration();

