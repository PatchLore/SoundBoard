import { Category } from '../types/track';

export const STREAMING_CATEGORIES: Category[] = [
  {
    id: 'stream-starting',
    name: 'Stream Starting Soon',
    description: 'Professional intro music for stream openings',
    color: '#ff6b6b',
    icon: '🎬',
    trackCount: 0
  },
  {
    id: 'chill-gaming',
    name: 'Chill Gaming',
    description: 'Background music for relaxed gameplay',
    color: '#4ecdc4',
    icon: '🎮',
    trackCount: 0
  },
  {
    id: 'gaming-action',
    name: 'Gaming Action',
    description: 'High-energy music for intense gameplay',
    color: '#45b7d1',
    icon: '⚔️',
    trackCount: 0
  },
  {
    id: 'hype-raid',
    name: 'Hype Raid',
    description: 'Pump-up music for exciting moments',
    color: '#f9ca24',
    icon: '🔥',
    trackCount: 0
  },
  {
    id: 'break-brb',
    name: 'Break/BRB',
    description: 'Pleasant waiting music for breaks',
    color: '#6c5ce7',
    icon: '⏸️',
    trackCount: 0
  },
  {
    id: 'talk-show',
    name: 'Talk Show',
    description: 'Background music for conversations',
    color: '#a29bfe',
    icon: '🎙️',
    trackCount: 0
  },
  {
    id: 'intro-outro',
    name: 'Intro/Outro',
    description: 'Short tracks for beginnings and endings',
    color: '#fd79a8',
    icon: '🎵',
    trackCount: 0
  },
  {
    id: 'boss-battle',
    name: 'Boss Battle',
    description: 'Epic music for challenging moments',
    color: '#e17055',
    icon: '🐉',
    trackCount: 0
  },
  {
    id: 'intermission',
    name: 'Intermission',
    description: 'Transitional music between segments',
    color: '#00b894',
    icon: '🔄',
    trackCount: 0
  },
  {
    id: 'background-chat',
    name: 'Background Chat',
    description: 'Subtle music for viewer interaction',
    color: '#fdcb6e',
    icon: '💬',
    trackCount: 0
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return STREAMING_CATEGORIES.find(cat => cat.id === id);
};

export const getStreamingCategories = (): string[] => {
  return STREAMING_CATEGORIES.map(cat => cat.id);
};

export const getCategoryDisplayName = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.name || categoryId;
};

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || '#6b7280';
};

export const getCategoryIcon = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.icon || '🎵';
};

export const getCategoryDescription = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.description || '';
};

export const updateCategoryTrackCount = (categoryId: string, count: number) => {
  const category = STREAMING_CATEGORIES.find(cat => cat.id === categoryId);
  if (category) {
    category.trackCount = count;
  }
};

export const getTotalTrackCount = (): number => {
  return STREAMING_CATEGORIES.reduce((total, cat) => total + cat.trackCount, 0);
};



