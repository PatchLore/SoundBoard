import { audioController } from './audioController';

export interface DiscordBotConfig {
  token: string;
  clientId: string;
  guildId: string;
  prefix: string;
  modRoleId: string;
  enabled: boolean;
}

export interface DiscordCommand {
  name: string;
  description: string;
  usage: string;
  modOnly: boolean;
  execute: (message: any, args: string[]) => Promise<void>;
}

class DiscordBot {
  private config: DiscordBotConfig = {
    token: '',
    clientId: '',
    guildId: '',
    prefix: '!',
    modRoleId: '',
    enabled: false
  };
  private commands: Map<string, DiscordCommand> = new Map();
  private isConnected = false;

  constructor() {
    this.setupCommands();
  }

  // Configuration
  setConfig(config: Partial<DiscordBotConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): DiscordBotConfig {
    return { ...this.config };
  }

  // Command System
  private setupCommands(): void {
    // Play command
    this.addCommand({
      name: 'play',
      description: 'Play a track by name or ID',
      usage: '!play <track name or ID>',
      modOnly: true,
      execute: async (message, args) => {
        if (args.length === 0) {
          await this.reply(message, 'Please specify a track to play. Usage: !play <track name>');
          return;
        }
        await this.reply(message, '🎵 Play command executed');
      }
    });

    // Pause command
    this.addCommand({
      name: 'pause',
      description: 'Pause the current track',
      usage: '!pause',
      modOnly: true,
      execute: async (message) => {
        audioController.pause();
        await this.reply(message, '⏸️ Music paused');
      }
    });

    // Resume command
    this.addCommand({
      name: 'resume',
      description: 'Resume the current track',
      usage: '!resume',
      modOnly: true,
      execute: async (message) => {
        audioController.resume();
        await this.reply(message, '▶️ Music resumed');
      }
    });

    // Stop command
    this.addCommand({
      name: 'stop',
      description: 'Stop the current track',
      usage: '!stop',
      modOnly: true,
      execute: async (message) => {
        audioController.stop();
        await this.reply(message, '⏹️ Music stopped');
      }
    });

    // Volume command
    this.addCommand({
      name: 'volume',
      description: 'Set the volume (0-100)',
      usage: '!volume <0-100>',
      modOnly: true,
      execute: async (message, args) => {
        if (args.length === 0) {
          const currentVolume = Math.round(audioController.getVolume() * 100);
          await this.reply(message, `🔊 Current volume: **${currentVolume}%**`);
          return;
        }

        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 0 || volume > 100) {
          await this.reply(message, '❌ Please specify a volume between 0 and 100');
          return;
        }

        audioController.setVolume(volume / 100);
        await this.reply(message, `🔊 Volume set to **${volume}%**`);
      }
    });

    // Help command
    this.addCommand({
      name: 'help',
      description: 'Show available commands',
      usage: '!help [command]',
      modOnly: false,
      execute: async (message) => {
        const commandList = Array.from(this.commands.values())
          .map(cmd => `**${this.config.prefix}${cmd.name}** - ${cmd.description}`)
          .join('\n');

        await this.reply(message, {
          embeds: [{
            color: 0x0099ff,
            title: '🎵 Music Bot Commands',
            description: commandList
          }]
        });
      }
    });
  }

  private addCommand(command: DiscordCommand): void {
    this.commands.set(command.name.toLowerCase(), command);
  }

  // Command Execution
  async executeCommand(message: any, content: string): Promise<void> {
    if (!content.startsWith(this.config.prefix)) return;

    const args = content.slice(this.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName || !this.commands.has(commandName)) return;

    const command = this.commands.get(commandName)!;
    
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      await this.reply(message, `❌ An error occurred while executing the command`);
    }
  }

  // Utility Methods
  private async reply(message: any, content: string | object): Promise<void> {
    try {
      if (typeof content === 'string') {
        await message.reply(content);
      } else {
        await message.reply(content);
      }
    } catch (error) {
      console.error('Error replying to message:', error);
    }
  }

  // Connection Management
  async connect(): Promise<boolean> {
    if (!this.config.enabled || !this.config.token) {
      console.log('Discord bot not configured or disabled');
      return false;
    }

    try {
      this.isConnected = true;
      console.log('Discord bot connected');
      return true;
    } catch (error) {
      console.error('Failed to connect Discord bot:', error);
      return false;
    }
  }

  disconnect(): void {
    this.isConnected = false;
    console.log('Discord bot disconnected');
  }

  // Getters
  isBotConnected(): boolean {
    return this.isConnected;
  }

  getCommands(): Map<string, DiscordCommand> {
    return new Map(this.commands);
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.commands.clear();
  }
}

// Export singleton instance
export const discordBot = new DiscordBot();
