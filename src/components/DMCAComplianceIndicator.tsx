import React from 'react';
import { motion } from 'framer-motion';
import { StreamingTrack } from '../types/track';
import { usageTrackingService } from '../services/usageTrackingService';

interface DMCAComplianceIndicatorProps {
  track: StreamingTrack;
  showDetails?: boolean;
  onTrackUsage?: (trackId: string) => void;
  compact?: boolean; // New prop for compact display
}

const DMCAComplianceIndicator: React.FC<DMCAComplianceIndicatorProps> = ({ 
  track, 
  showDetails = false,
  onTrackUsage,
  compact = false
}) => {
  // Simplified - all YouTube Audio Library tracks are safe
  const getLicenseColor = (license: string) => {
    switch (license) {
      case 'royalty_free': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'creative_commons': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'public_domain': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'licensed': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const handleTrackUsage = () => {
    // Track usage with real service
    usageTrackingService.trackUsage(track.id, 'default_agency', 'default_streamer');
    
    // Also call the callback if provided
    if (onTrackUsage) {
      onTrackUsage(track.id);
    }
  };

  // Get real usage data
  const trackUsage = usageTrackingService.getTrackUsage(track.id);
  const usageCount = trackUsage?.usageCount || 0;
  const lastUsed = trackUsage?.lastUsed;

  // Compact version for track cards
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1"
      >
        {/* DMCA Safe Indicator */}
        {track.dmcaSafe ? (
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="w-5 h-5 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center"
            title="DMCA Safe - Safe for streaming"
          >
            <span className="text-green-400 text-xs">✅</span>
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="w-5 h-5 bg-yellow-600/20 border border-yellow-600/30 rounded-full flex items-center justify-center"
            title="DMCA Warning - Check licensing"
          >
            <span className="text-yellow-400 text-xs">⚠️</span>
          </motion.div>
        )}

        {/* VOD Safe Indicator */}
        {track.vodSafe && (
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="w-5 h-5 bg-blue-600/20 border border-blue-600/30 rounded-full flex items-center justify-center"
            title="VOD Safe - Safe for recorded content"
          >
            <span className="text-blue-400 text-xs">📹</span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Main Compliance Badges */}
      <div className="flex flex-wrap gap-2">
        {/* DMCA Safe Badge */}
        {track.dmcaSafe && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-full text-xs font-medium flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            DMCA Safe
          </motion.div>
        )}

        {/* VOD Safe Badge */}
        {track.vodSafe && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-xs font-medium flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            VOD Safe
          </motion.div>
        )}

        {/* License Badge */}
        {track.license && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`px-3 py-1 border rounded-full text-xs font-medium ${getLicenseColor(track.license)}`}
          >
            {track.license.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </motion.div>
        )}
      </div>

      {/* Platform Safety Info */}
      {showDetails && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-white">Platform Safety</h4>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${track.dmcaSafe ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-300">Twitch</span>
              <span className={track.dmcaSafe ? 'text-green-400' : 'text-red-400'}>
                {track.dmcaSafe ? 'Safe' : 'Risk'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${track.vodSafe ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-gray-300">YouTube</span>
              <span className={track.vodSafe ? 'text-green-400' : 'text-yellow-400'}>
                {track.vodSafe ? 'Safe' : 'Check'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${track.dmcaSafe ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-300">Facebook</span>
              <span className={track.dmcaSafe ? 'text-green-400' : 'text-red-400'}>
                {track.dmcaSafe ? 'Safe' : 'Risk'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${track.dmcaSafe ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-gray-300">TikTok</span>
              <span className={track.dmcaSafe ? 'text-green-400' : 'text-yellow-400'}>
                {track.dmcaSafe ? 'Safe' : 'Check'}
              </span>
            </div>
          </div>

          {/* Usage Tracking */}
          <div className="border-t border-gray-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Usage Count</span>
              <span className="text-xs text-white font-medium">{usageCount}</span>
            </div>
            {lastUsed && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last Used</span>
                <span className="text-xs text-gray-300">
                  {new Date(lastUsed).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleTrackUsage}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              Track Usage
            </button>
            <button
              onClick={() => usageTrackingService.toggleFavorite(track.id)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                trackUsage?.favorite 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {trackUsage?.favorite ? '❤️' : '🤍'} Favorite
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DMCAComplianceIndicator;
