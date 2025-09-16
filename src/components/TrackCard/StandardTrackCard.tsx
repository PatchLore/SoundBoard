import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../../types/track';
import { TRACK_CARD_STYLES, ARIA_LABELS } from './constants';
import { 
  formatDuration, 
  getMoodColor, 
  getEnergyDisplay, 
  formatCategoryName, 
  getTopTags, 
  getBpmKeyDisplay,
  copyAttribution,
  generateTrackCardId
} from './utils';
import SourceLabel from './SourceLabel';

interface StandardTrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
  onPause?: (track: Track) => void;
  onEdit?: (track: Track) => void;
  onDelete?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onRemoveFromPlaylist?: (track: Track) => void;
  isPlaying?: boolean;
  showActions?: boolean;
  showTags?: boolean;
  showDetails?: boolean;
  showAdminControls?: boolean;
  compact?: boolean;
  className?: string;
  onAnnounce?: (message: string) => void;
  trackSource?: 'client' | 'streamer';
}

const StandardTrackCard: React.FC<StandardTrackCardProps> = ({
  track,
  onPlay,
  onPause,
  onEdit,
  onDelete,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  isPlaying = false,
  showActions = true,
  showTags = true,
  showDetails = true,
  showAdminControls = false,
  compact = false,
  className = '',
  onAnnounce,
  trackSource
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get styling based on compact mode
  const size = compact ? 'compact' : 'normal';
  const containerClass = `${TRACK_CARD_STYLES.container.base} ${TRACK_CARD_STYLES.container.padding[size]} ${className}`;
  const titleClass = TRACK_CARD_STYLES.typography.title[size];
  const artistClass = TRACK_CARD_STYLES.typography.artist[size];
  const detailsClass = TRACK_CARD_STYLES.typography.details[size];
  const sectionSpacing = TRACK_CARD_STYLES.spacing.section[size];
  const tagsSpacing = TRACK_CARD_STYLES.spacing.tags[size];
  const actionsSpacing = TRACK_CARD_STYLES.spacing.actions[size];

  // Event handlers with accessibility announcements
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      onPause?.(track);
      onAnnounce?.(`${track.title} paused`);
    } else {
      onPlay?.(track);
      onAnnounce?.(`${track.title} now playing`);
    }
  }, [isPlaying, track, onPlay, onPause, onAnnounce]);

  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onAnnounce?.(`${track.title} ${newLikedState ? 'liked' : 'unliked'}`);
  }, [isLiked, track, onAnnounce]);

  const handlePlaylistToggle = useCallback(() => {
    const newPlaylistState = !isInPlaylist;
    if (newPlaylistState) {
      onAddToPlaylist?.(track);
      onAnnounce?.(`${track.title} added to playlist`);
    } else {
      onRemoveFromPlaylist?.(track);
      onAnnounce?.(`${track.title} removed from playlist`);
    }
    setIsInPlaylist(newPlaylistState);
  }, [isInPlaylist, track, onAddToPlaylist, onRemoveFromPlaylist, onAnnounce]);

  const handleCopyAttribution = useCallback(() => {
    copyAttribution(track);
    onAnnounce?.(`Attribution for ${track.title} copied to clipboard`);
  }, [track, onAnnounce]);

  // Keyboard event handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  // Get top tags with overflow
  const { visibleTags, hasOverflow, overflowCount } = getTopTags(track.tags, TRACK_CARD_STYLES.tags.maxVisible);
  const bpmKeyDetails = getBpmKeyDisplay(track);

  return (
    <motion.div
      className={`${containerClass} flex flex-col h-full`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2, scale: 1.02 }}
      layout
      role="article"
      aria-label={`Track: ${track.title} by ${track.artist}`}
    >
      {/* Track Header */}
      <div className={`flex items-start justify-between ${sectionSpacing}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`${titleClass} truncate`} title={track.title}>
              {track.title}
            </h3>
            {trackSource && <SourceLabel source={trackSource} />}
          </div>
          <p className={`${artistClass} truncate`} title={track.artist}>
            {track.artist}
          </p>
        </div>
        
        {/* Duration and Featured Badge */}
        <div className="flex items-center space-x-2 ml-2">
          <span className={TRACK_CARD_STYLES.badges.indicator}>
            {formatDuration(track.duration)}
          </span>
          {track.featured && (
            <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-500/30">
              ⭐ Featured
            </span>
          )}
        </div>
      </div>

      {/* Content Area - Flexible */}
      <div className="flex-1 flex flex-col">
        {/* Category and Mood Badges */}
        <div className={`flex items-center gap-2 ${sectionSpacing}`}>
          <span className={TRACK_CARD_STYLES.badges.category}>
            {formatCategoryName(track.category)}
          </span>
          {track.mood && (
            <span className={`${TRACK_CARD_STYLES.badges.mood} ${getMoodColor(track.mood)}`}>
              {track.mood}
            </span>
          )}
        </div>

        {/* Track Details */}
        {showDetails && (
          <div className={`${detailsClass} space-y-1 ${sectionSpacing}`}>
            <div className="flex items-center justify-between">
              <span>Energy:</span>
              <span className="text-yellow-400 font-medium" aria-label={`Energy: ${getEnergyDisplay(track.energy)}`}>
                {getEnergyDisplay(track.energy)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Duration:</span>
              <span className={TRACK_CARD_STYLES.badges.indicator}>{formatDuration(track.duration)}</span>
            </div>
            
            {bpmKeyDetails.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Details:</span>
                <div className="flex items-center space-x-2">
                  {bpmKeyDetails.map((detail, index) => (
                    <span key={index} className={TRACK_CARD_STYLES.badges.indicator}>
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Track Indicators */}
        <div className={`flex flex-wrap gap-1 ${sectionSpacing}`}>
          {track.dmcaSafe && (
            <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-500/30">
              ✅ DMCA Safe
            </span>
          )}
          {track.loopFriendly && (
            <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-full border border-blue-500/30">
              🔄 Loop Friendly
            </span>
          )}
          {track.streamSafe && (
            <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded-full border border-purple-500/30">
              📹 Stream Safe
            </span>
          )}
        </div>

        {/* Tags */}
        {showTags && track.tags.length > 0 && (
          <div className={tagsSpacing}>
            <div className="flex flex-wrap gap-1">
              {visibleTags.map((tag, index) => (
                <span key={index} className={TRACK_CARD_STYLES.badges.tag}>
                  #{tag}
                </span>
              ))}
              {hasOverflow && (
                <span className={`${TRACK_CARD_STYLES.badges.tag} ${TRACK_CARD_STYLES.tags.overflowText}`}>
                  +{overflowCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Upload Info */}
        <div className="mt-auto pt-3 border-t border-stream-light/10">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Uploaded: {new Date(track.uploadDate).toLocaleDateString()}</span>
            <span>by {track.uploadedBy}</span>
          </div>
          {!track.approved && (
            <div className="mt-2 text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded-full border border-orange-500/30 text-center">
              ⏳ Pending Approval
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className={`space-y-3 ${actionsSpacing}`}>
          {/* Primary Play/Pause Button */}
          <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            onKeyDown={(e) => handleKeyDown(e, handlePlayPause)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center gap-3 min-h-[48px] ${
              isPlaying 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25'
            }`}
            aria-label={isPlaying ? ARIA_LABELS.pause : ARIA_LABELS.play}
            aria-pressed={isPlaying}
            id={generateTrackCardId(track, 'play-pause')}
            type="button"
              title={isPlaying ? 'Pause track' : 'Play track'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
              <span className="text-base font-semibold">
                {isPlaying ? 'Pause' : 'Play'}
              </span>
          </motion.button>
          </div>

          {/* Secondary Actions: keep Like visible; move others into a compact menu */}
          <div className="flex items-center justify-center gap-2">
            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              onKeyDown={(e) => handleKeyDown(e, handleLike)}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center gap-1.5 min-h-[40px] ${
                isLiked 
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30' 
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
              aria-label={isLiked ? ARIA_LABELS.unlike : ARIA_LABELS.like}
              aria-pressed={isLiked}
              id={generateTrackCardId(track, 'like')}
              type="button"
              title={isLiked ? 'Unlike track' : 'Like track'}
            >
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs font-medium">
                {isLiked ? 'Liked' : 'Like'}
              </span>
            </motion.button>

            {/* Kebab menu for additional actions */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                onKeyDown={(e) => handleKeyDown(e, () => setIsMenuOpen((v) => !v))}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                className="px-2 py-2 rounded-lg bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                title="More actions"
                id={generateTrackCardId(track, 'more-actions')}
                type="button"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="sr-only">More actions</span>
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  aria-label="Track actions"
                  className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-700 bg-gray-800 shadow-lg focus:outline-none"
                >
                  <button
                    role="menuitem"
                    onClick={() => { setIsMenuOpen(false); handlePlaylistToggle(); }}
                    onKeyDown={(e) => handleKeyDown(e, () => { setIsMenuOpen(false); handlePlaylistToggle(); })}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/60 rounded-t-lg"
                    aria-label={isInPlaylist ? ARIA_LABELS.removeFromPlaylist : ARIA_LABELS.addToPlaylist}
                    type="button"
                    title={isInPlaylist ? 'Remove from playlist' : 'Add to playlist'}
                  >
                    {isInPlaylist ? 'Remove from playlist' : 'Add to playlist'}
                  </button>
                  {onEdit && (
                    <button
                      role="menuitem"
                      onClick={() => { setIsMenuOpen(false); onEdit(track); }}
                      onKeyDown={(e) => handleKeyDown(e, () => { setIsMenuOpen(false); onEdit(track); })}
                      className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/60"
                      aria-label="Edit track"
                      type="button"
                      title="Edit track details"
                    >
                      Edit track
                    </button>
                  )}
                  <button
                    role="menuitem"
                    onClick={() => { setIsMenuOpen(false); handleCopyAttribution(); }}
                    onKeyDown={(e) => handleKeyDown(e, () => { setIsMenuOpen(false); handleCopyAttribution(); })}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/60 rounded-b-lg"
                    aria-label={ARIA_LABELS.copyAttribution}
                    type="button"
                    title="Copy attribution text"
                  >
                    Copy attribution
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Controls - Only shown when showAdminControls is true */}
      {showAdminControls && (
        <motion.div
          className="absolute top-2 right-2 flex items-center space-x-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {onEdit && (
            <button
              onClick={() => onEdit(track)}
              onKeyDown={(e) => handleKeyDown(e, () => onEdit(track))}
              className="px-2 py-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center gap-1.5 text-xs font-medium min-h-[32px]"
              aria-label={ARIA_LABELS.edit}
              id={generateTrackCardId(track, 'edit')}
              type="button"
              title="Edit track"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(track)}
              onKeyDown={(e) => handleKeyDown(e, () => onDelete(track))}
              className="px-2 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center gap-1.5 text-xs font-medium min-h-[32px]"
              aria-label={ARIA_LABELS.delete}
              id={generateTrackCardId(track, 'delete')}
              type="button"
              title="Delete track"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          )}
        </motion.div>
      )}

    </motion.div>
  );
};

export default StandardTrackCard;
