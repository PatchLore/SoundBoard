// Standardized styling constants for track cards
export const TRACK_CARD_STYLES = {
  // Container styles
  container: {
    base: 'bg-stream-gray rounded-xl border border-stream-light/20 hover:border-stream-accent/50 transition-all duration-300',
    padding: {
      compact: 'p-3',
      normal: 'p-4',
      large: 'p-6'
    }
  },

  // Typography
  typography: {
    title: {
      compact: 'text-sm font-semibold text-white truncate mb-1',
      normal: 'text-base font-semibold text-white truncate mb-1',
      large: 'text-lg font-bold text-white mb-2'
    },
    artist: {
      compact: 'text-xs text-gray-400 truncate',
      normal: 'text-sm text-gray-400 truncate',
      large: 'text-sm text-gray-400 mb-2'
    },
    details: {
      compact: 'text-xs text-gray-500',
      normal: 'text-sm text-gray-500',
      large: 'text-sm text-gray-500'
    }
  },

  // Spacing
  spacing: {
    section: {
      compact: 'mb-2',
      normal: 'mb-3',
      large: 'mb-4'
    },
    tags: {
      compact: 'mb-2',
      normal: 'mb-3',
      large: 'mb-4'
    },
    actions: {
      compact: 'mt-2',
      normal: 'mt-3',
      large: 'mt-4'
    }
  },

  // Button styles
  buttons: {
    // Primary action buttons (play/pause)
    primary: {
      base: 'w-10 h-10 min-w-10 min-h-10 flex items-center justify-center rounded-xl font-medium transition-all duration-200',
      play: 'bg-blue-600 text-white hover:bg-blue-700',
      pause: 'bg-red-600 text-white hover:bg-red-700',
      disabled: 'opacity-50 cursor-not-allowed'
    },
    // Secondary action buttons (like, playlist, etc.)
    secondary: {
      base: 'w-10 h-10 min-w-10 min-h-10 flex items-center justify-center rounded-lg transition-all duration-200',
      active: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
      inactive: 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
    },
    // Full-width buttons
    fullWidth: {
      base: 'w-full py-2 px-3 rounded-lg font-medium transition-all duration-200',
      primary: 'bg-stream-accent hover:bg-stream-accent/90 text-white',
      secondary: 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
    }
  },

  // Badge styles
  badges: {
    category: 'px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30',
    mood: 'px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-600/30',
    tag: 'px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full',
    indicator: 'px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-full'
  },

  // Tag display
  tags: {
    maxVisible: 2,
    maxWithOverflow: 4,
    overflowText: '…'
  }
} as const;

// Color mappings for mood and category
export const MOOD_COLORS = {
  'chill': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'epic': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'energetic': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'mysterious': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'uplifting': 'bg-green-500/20 text-green-400 border-green-500/30',
  'dark': 'bg-gray-700/20 text-gray-300 border-gray-600/30',
  'peaceful': 'bg-teal-500/20 text-teal-400 border-teal-500/30'
} as const;

// ARIA labels for accessibility
export const ARIA_LABELS = {
  play: 'Play track',
  pause: 'Pause track',
  like: 'Like track',
  unlike: 'Unlike track',
  addToPlaylist: 'Add to playlist',
  removeFromPlaylist: 'Remove from playlist',
  edit: 'Edit track',
  delete: 'Delete track',
  copyAttribution: 'Copy attribution text',
  download: 'Download track'
} as const;



