import React from 'react';
import { Track } from '../types/track';
import StandardTrackCard from './TrackCard/StandardTrackCard';

interface EnhancedTrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onEdit?: (track: Track) => void;
  onDelete?: (track: Track) => void;
  showAdminControls?: boolean;
  isPlaying?: boolean;
  className?: string;
}

const EnhancedTrackCard: React.FC<EnhancedTrackCardProps> = ({
  track,
  onPlay,
  onAddToPlaylist,
  onEdit,
  onDelete,
  showAdminControls = false,
  isPlaying = false,
  className = ''
}) => {
  return (
    <StandardTrackCard
      track={track}
      onPlay={onPlay}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddToPlaylist={onAddToPlaylist}
      isPlaying={isPlaying}
      showActions={true}
      showTags={true}
      showDetails={true}
      showAdminControls={showAdminControls}
      compact={false}
      className={className}
    />
  );
};

export default EnhancedTrackCard;
