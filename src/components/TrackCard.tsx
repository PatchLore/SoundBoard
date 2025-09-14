import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../types/track';
import unifiedAudioController from '../services/unifiedAudioController';
import StandardTrackCard from './TrackCard/StandardTrackCard';
import { ARIA_LABELS, TRACK_CARD_STYLES } from './TrackCard/constants';
import { formatDuration, getMoodColor, formatCategoryName, getTopTags, copyAttribution, generateTrackCardId } from './TrackCard/utils';

interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
  onPause?: (track: Track) => void;
  onEdit?: (track: Track) => void;
  isPlaying?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = memo(({
  track,
  onPlay,
  onPause,
  onEdit,
  isPlaying = false,
  showActions = true,
  compact = false
}) => {
  // Handle play/pause with unified audio controller
  const handlePlay = (track: Track) => {
    unifiedAudioController.playTrack(track).catch(console.error);
    onPlay?.(track);
  };

  const handlePause = (track: Track) => {
    unifiedAudioController.stop();
    onPause?.(track);
  };

  return (
    <StandardTrackCard
      track={track}
      onPlay={handlePlay}
      onPause={handlePause}
      onEdit={onEdit}
      isPlaying={isPlaying}
      showActions={showActions}
      compact={compact}
      showTags={true}
      showDetails={true}
      showAdminControls={false}
    />
  );
});

TrackCard.displayName = 'TrackCard';

export default TrackCard;

