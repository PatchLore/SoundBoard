import React, { useEffect } from 'react';
import { StreamingTrack } from '../types/track';
import unifiedAudioController from '../services/unifiedAudioController';
import StandardTrackCard from './TrackCard/StandardTrackCard';

interface LightweightTrackCardProps {
  track: StreamingTrack;
  onPlay?: (track: StreamingTrack) => void;
  onPause?: (track: StreamingTrack) => void;
  isPlaying?: boolean;
  compact?: boolean;
}

const LightweightTrackCard: React.FC<LightweightTrackCardProps> = ({
  track,
  onPlay,
  onPause,
  isPlaying = false,
  compact = false
}) => {
  // Register with unified audio controller
  useEffect(() => {
    const stopCallback = () => onPause?.(track);
    unifiedAudioController.registerStopListener(track.id, stopCallback);
    
    return () => {
      unifiedAudioController.unregisterStopListener(track.id);
    };
  }, [track.id, onPause, track]);

  const handlePlay = (track: StreamingTrack) => {
    unifiedAudioController.playTrack(track).catch(console.error);
    onPlay?.(track);
  };

  const handlePause = (track: StreamingTrack) => {
    unifiedAudioController.pause();
    onPause?.(track);
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
      compact={compact}
    />
  );
};

export default LightweightTrackCard;
