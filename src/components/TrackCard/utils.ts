import { Track } from '../../types/track';
import { MOOD_COLORS } from './constants';

// Format duration from seconds to MM:SS
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get mood color classes
export const getMoodColor = (mood: string): string => {
  return MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

// Get energy display as stars
export const getEnergyDisplay = (energy: number): string => {
  return '⭐'.repeat(energy);
};

// Format category name (convert kebab-case to Title Case)
export const formatCategoryName = (category: string): string => {
  return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Get top tags with overflow handling
export const getTopTags = (tags: string[], maxVisible: number = 2): {
  visibleTags: string[];
  hasOverflow: boolean;
  overflowCount: number;
} => {
  const visibleTags = tags.slice(0, maxVisible);
  const hasOverflow = tags.length > maxVisible;
  const overflowCount = tags.length - maxVisible;
  
  return {
    visibleTags,
    hasOverflow,
    overflowCount
  };
};

// Get BPM and Key display
export const getBpmKeyDisplay = (track: Track): string[] => {
  const details: string[] = [];
  if (track.bpm) details.push(`${track.bpm} BPM`);
  if (track.key) details.push(track.key);
  return details;
};

// Copy attribution text to clipboard
export const copyAttribution = async (track: Track): Promise<void> => {
  const attribution = `${track.title} by ${track.artist}`;
  try {
    await navigator.clipboard.writeText(attribution);
  } catch (error) {
    console.error('Failed to copy attribution:', error);
  }
};

// Generate unique IDs for accessibility
export const generateTrackCardId = (track: Track, suffix: string): string => {
  return `track-${track.id}-${suffix}`;
};
