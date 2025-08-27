import React from 'react';
import { obsIntegration } from '../services/obsIntegration';
import { discordBot } from '../services/discordBot';
import { twitchIntegration } from '../services/twitchIntegration';
import { apiEndpoints } from '../services/apiEndpoints';

const IntegrationDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Platform Integrations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OBS Integration */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">📺 OBS Studio</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${obsIntegration.isConnected() ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-white">
                {obsIntegration.isConnected() ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              WebSocket integration for scene management and audio control
            </p>
          </div>
        </div>

        {/* Discord Bot */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">💬 Discord Bot</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${discordBot.isBotConnected() ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-white">
                {discordBot.isBotConnected() ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Moderator commands for music control via Discord
            </p>
          </div>
        </div>

        {/* Twitch Integration */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">🎮 Twitch Chat</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${twitchIntegration.isTwitchConnected() ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-white">
                {twitchIntegration.isTwitchConnected() ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Chat commands for sound requests and mod controls
            </p>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">🔗 API Server</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${apiEndpoints.isServerRunning() ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-white">
                {apiEndpoints.isServerRunning() ? 'Running' : 'Stopped'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              REST API for third-party integrations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDashboard;
