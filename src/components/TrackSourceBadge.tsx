import React from 'react';

interface TrackSourceBadgeProps {
  source: 'agency' | 'streamer';
  className?: string;
}

const TrackSourceBadge: React.FC<TrackSourceBadgeProps> = ({ source, className = '' }) => {
  const getBadgeStyles = () => {
    switch (source) {
      case 'agency':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'streamer':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getBadgeText = () => {
    switch (source) {
      case 'agency':
        return 'Agency';
      case 'streamer':
        return 'Streamer';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full border font-medium ${getBadgeStyles()} ${className}`}>
      {getBadgeText()}
    </span>
  );
};

export default TrackSourceBadge;



