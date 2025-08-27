import React, { useState, useEffect } from 'react';
import { StreamingTrack } from '../types/track';
import audioController from '../services/audioController';
import DMCAComplianceIndicator from './DMCAComplianceIndicator';

interface UltraLightTrackCardProps {
  track: StreamingTrack;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
}

const UltraLightTrackCard: React.FC<UltraLightTrackCardProps> = ({ track, onPlay, onPause, isPlaying: externalIsPlaying }) => {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  
  // Use external isPlaying if provided, otherwise use internal state
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;

  // Register with audio controller
  useEffect(() => {
    const stopCallback = () => {
      if (onPause) {
        onPause();
      } else {
        setInternalIsPlaying(false);
      }
    };
    audioController.registerStopListener(track.id, stopCallback);
    
    return () => {
      audioController.unregisterStopListener(track.id);
    };
  }, [track.id, onPause]);

  const handlePlay = () => {
    console.log('🎵 UltraLightTrackCard Play button clicked for:', track.title);
    if (isPlaying) {
      console.log('🎵 Stopping track:', track.title);
      if (onPause) {
        onPause();
      } else {
        setInternalIsPlaying(false);
        audioController.stopTrack(track.id);
      }
    } else {
      console.log('🎵 Starting track:', track.title);
      if (onPlay) {
        onPlay();
      } else {
        setInternalIsPlaying(true);
        audioController.setPlayingTrack(track.id);
      }
    }
  };

  // const handlePause = () => {
  //   if (onPause) {
  //     onPause();
  //   } else {
  //     setInternalIsPlaying(false);
  //     audioController.stopTrack(track.id);
  //   }
  // };

  // const handleEnd = () => {
  //   if (onPause) {
  //     onPause();
  //   } else {
  //     setInternalIsPlaying(false);
  //     audioController.stopTrack(track.id);
  //   }
  // };

  return (
    <div className="bg-gray-800 border border-gray-600 p-3 rounded">


      {/* Track Title - Minimal */}
      <h3 className="text-sm font-medium text-white truncate mb-2">{track.title}</h3>
      
      {/* Duration - Minimal */}
      <div className="text-xs text-gray-400 mb-2">{track.duration}</div>
      
      {/* Category - Minimal */}
      <div className="text-xs text-blue-400 mb-2">{track.streamingCategory}</div>
      
      {/* DMCA Compliance Indicator - Compact */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">DMCA</span>
        <DMCAComplianceIndicator 
          track={track} 
          compact={true}
        />
      </div>
      
      {/* Play Button - Simple */}
      <button
        onClick={handlePlay}
        className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
          isPlaying
            ? 'bg-red-600 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );
};

export default UltraLightTrackCard;
