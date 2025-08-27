export interface Agency {
  id: string;
  name: string;
  description: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customCSS?: string;
  brandedCategories?: { [key: string]: string };
  customPlaylists?: string[];
  createdAt: string;
  updatedAt: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  maxUsers: number;
  features: string[];
}

export interface UserRole {
  type: 'streamer' | 'agency';
  permissions: string[];
  agencyId?: string;
  userId: string;
  canUploadTracks?: boolean;
  canManageUsers?: boolean;
  canCustomizeBranding?: boolean;
  canViewAnalytics?: boolean;
}

export interface AgencyMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'streamer';
  agencyId: string;
  joinedAt: string;
  lastActive: string;
  permissions: string[];
  isActive: boolean;
}

export interface AgencyTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  customCSS?: string;
  brandedCategories?: { [key: string]: string };
  customPlaylists?: string[];
}

export interface RoleBasedComponentProps {
  userRole: UserRole;
  children?: React.ReactNode;
}

export interface RoleGuardProps {
  userRole: UserRole;
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Permission constants
export const PERMISSIONS = {
  UPLOAD_TRACKS: 'upload_tracks',
  MANAGE_USERS: 'manage_users',
  CUSTOMIZE_BRANDING: 'customize_branding',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_PLAYLISTS: 'manage_playlists',
  APPROVE_TRACKS: 'approve_tracks',
  BULK_OPERATIONS: 'bulk_operations',
  EXPORT_DATA: 'export_data'
} as const;

// Role definitions
export const ROLE_PERMISSIONS = {
  streamer: [
    PERMISSIONS.MANAGE_PLAYLISTS
  ],
  agency: [
    PERMISSIONS.UPLOAD_TRACKS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.CUSTOMIZE_BRANDING,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_PLAYLISTS,
    PERMISSIONS.APPROVE_TRACKS,
    PERMISSIONS.BULK_OPERATIONS,
    PERMISSIONS.EXPORT_DATA
  ]
} as const;

export interface Streamer {
  id: string;
  name: string;
  email: string;
  agencyId: string;
  avatar?: string;
  isActive: boolean;
  soundboardConfig: SoundboardConfig;
  usageStats: UsageStats;
  createdAt: string;
  updatedAt: string;
}

export interface SoundboardConfig {
  favoriteTracks: string[];
  customCategories: string[];
  volumeDefaults: number;
  autoplaySettings: boolean;
  defaultMood: string;
  defaultGenre: string;
  defaultEnergyLevel: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface UsageStats {
  totalPlayTime: number; // in seconds
  tracksPlayed: number;
  lastActive: string;
  favoriteMoods: string[];
  favoriteGenres: string[];
  peakUsageHours: number[];
}

export interface AgencyBranding {
  agencyId: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customCSS?: string;
  fontFamily?: string;
  borderRadius?: string;
  shadowStyle?: string;
}

export interface BulkOperation {
  id: string;
  agencyId: string;
  operationType: 'volume_change' | 'track_add' | 'category_update' | 'theme_change';
  targetStreamers: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}







