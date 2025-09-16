import React, { useState, useEffect } from 'react';
import { StreamingTrack } from '../types/track';
import audioController from '../services/audioController';
import StandardTrackCard from './TrackCard/StandardTrackCard';

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

  const handlePlay = (track: StreamingTrack) => {
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

  const handlePause = (track: StreamingTrack) => {
    if (onPause) {
      onPause();
    } else {
      setInternalIsPlaying(false);
      audioController.stopTrack(track.id);
    }
  };

  return (
    <StandardTrackCard
      track={track}
      onPlay={handlePlay}
      onPause={handlePause}
      isPlaying={isPlaying}
      showActions={true}
      showTags={false}
      showDetails={false}
      showAdminControls={false}
      compact={true}
    />
  );
};

export default UltraLightTrackCard;
