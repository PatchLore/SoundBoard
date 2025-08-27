export interface User {
  id: string;
  email: string;
  userType: 'streamer' | 'agency';
  plan: string;
  isAuthenticated: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface FeatureFlags {
  // Track limits
  maxTracks: number;
  canGenerateAI: boolean;
  
  // Streamer features
  canUseHotkeys: boolean;
  canUseOBS: boolean;
  canUseDiscord: boolean;
  canUseProfessionalAudio: boolean;
  canUseIntegrations: boolean;
  
  // Agency features
  maxClients: number;
  canUseAnalytics: boolean;
  canUseBulkOperations: boolean;
  canUseBranding: boolean;
  canUseAdvancedAnalytics: boolean;
  
  // General features
  canUseCrossfade: boolean;
  canUseAdvancedFades: boolean;
  canUseLooping: boolean;
}

export interface StreamerUser extends User {
  userType: 'streamer';
  plan: 'starter' | 'pro';
  trackLimit: number;
  aiLimit: number;
}

export interface AgencyUser extends User {
  userType: 'agency';
  plan: 'small-agency' | 'medium-agency' | 'enterprise';
  streamerLimit: number;
  clients: string[];
}

class AuthService {
  private readonly USER_KEY = 'stream_soundboard_user';
  private readonly DEMO_USER: StreamerUser = {
    id: 'demo-123',
    email: 'demo@streamsoundboard.com',
    userType: 'streamer',
    plan: 'pro',
    isAuthenticated: true,
    createdAt: new Date(),
    lastLogin: new Date(),
    trackLimit: -1, // unlimited
    aiLimit: -1 // unlimited
  };

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        user.lastLogin = new Date(user.lastLogin);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Set user data in localStorage
  setUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Create a new user account
  createUser(email: string, userType: 'streamer' | 'agency', plan: string): User {
    const user: User = {
      id: this.generateId(),
      email,
      userType,
      plan,
      isAuthenticated: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    this.setUser(user);
    return user;
  }

  // Update user plan
  updateUserPlan(plan: string): void {
    const user = this.getCurrentUser();
    if (user) {
      user.plan = plan;
      this.setUser(user);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user?.isAuthenticated || false;
  }

  // Check if user is a streamer
  isStreamer(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 'streamer';
  }

  // Check if user is an agency
  isAgency(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 'agency';
  }

  // Get user plan
  getUserPlan(): string | null {
    const user = this.getCurrentUser();
    return user?.plan || null;
  }

  // Check if user has access to feature
  hasFeatureAccess(feature: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    switch (feature) {
      case 'unlimited_tracks':
        return user.userType === 'streamer' && user.plan === 'pro';
      case 'unlimited_ai':
        return user.userType === 'streamer' && user.plan === 'pro';
      case 'obs_integration':
        return user.userType === 'streamer' && user.plan === 'pro';
      case 'discord_bot':
        return user.userType === 'streamer' && user.plan === 'pro';
      case 'client_management':
        return user.userType === 'agency';
      case 'analytics':
        return (user.userType === 'streamer' && user.plan === 'pro') || user.userType === 'agency';
      case 'bulk_operations':
        return user.userType === 'agency';
      case 'branding_customization':
        return user.userType === 'agency';
      default:
        return false;
    }
  }

  // Login with demo account
  loginDemo(): StreamerUser {
    this.setUser(this.DEMO_USER);
    return this.DEMO_USER;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Generate unique ID
  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get comprehensive feature flags for current user
  getFeatureFlags(): FeatureFlags {
    const user = this.getCurrentUser();
    if (!user) {
      return this.getDefaultFeatureFlags();
    }

    switch (user.plan) {
      case 'starter':
        return {
          maxTracks: 10,
          canGenerateAI: false,
          canUseHotkeys: false,
          canUseOBS: false,
          canUseDiscord: false,
          canUseProfessionalAudio: false,
          canUseIntegrations: false,
          maxClients: 0,
          canUseAnalytics: false,
          canUseBulkOperations: false,
          canUseBranding: false,
          canUseAdvancedAnalytics: false,
          canUseCrossfade: false,
          canUseAdvancedFades: false,
          canUseLooping: false
        };
      
      case 'pro':
        return {
          maxTracks: -1, // unlimited
          canGenerateAI: true,
          canUseHotkeys: true,
          canUseOBS: true,
          canUseDiscord: true,
          canUseProfessionalAudio: true,
          canUseIntegrations: true,
          maxClients: 0,
          canUseAnalytics: true,
          canUseBulkOperations: false,
          canUseBranding: false,
          canUseAdvancedAnalytics: false,
          canUseCrossfade: true,
          canUseAdvancedFades: true,
          canUseLooping: true
        };
      
      case 'small-agency':
        return {
          maxTracks: -1, // unlimited
          canGenerateAI: true,
          canUseHotkeys: false,
          canUseOBS: false,
          canUseDiscord: false,
          canUseProfessionalAudio: false,
          canUseIntegrations: false,
          maxClients: 10,
          canUseAnalytics: true,
          canUseBulkOperations: false,
          canUseBranding: true,
          canUseAdvancedAnalytics: false,
          canUseCrossfade: true,
          canUseAdvancedFades: true,
          canUseLooping: true
        };
      
      case 'medium-agency':
        return {
          maxTracks: -1, // unlimited
          canGenerateAI: true,
          canUseHotkeys: false,
          canUseOBS: false,
          canUseDiscord: false,
          canUseProfessionalAudio: false,
          canUseIntegrations: false,
          maxClients: 25,
          canUseAnalytics: true,
          canUseBulkOperations: true,
          canUseBranding: true,
          canUseAdvancedAnalytics: true,
          canUseCrossfade: true,
          canUseAdvancedFades: true,
          canUseLooping: true
        };
      
      case 'enterprise':
        return {
          maxTracks: -1, // unlimited
          canGenerateAI: true,
          canUseHotkeys: false,
          canUseOBS: false,
          canUseDiscord: false,
          canUseProfessionalAudio: false,
          canUseIntegrations: false,
          maxClients: -1, // unlimited
          canUseAnalytics: true,
          canUseBulkOperations: true,
          canUseBranding: true,
          canUseAdvancedAnalytics: true,
          canUseCrossfade: true,
          canUseAdvancedFades: true,
          canUseLooping: true
        };
      
      default:
        return this.getDefaultFeatureFlags();
    }
  }

  // Get default feature flags (no access)
  private getDefaultFeatureFlags(): FeatureFlags {
    return {
      maxTracks: 0,
      canGenerateAI: false,
      canUseHotkeys: false,
      canUseOBS: false,
      canUseDiscord: false,
      canUseProfessionalAudio: false,
      canUseIntegrations: false,
      maxClients: 0,
      canUseAnalytics: false,
      canUseBulkOperations: false,
      canUseBranding: false,
      canUseAdvancedAnalytics: false,
      canUseCrossfade: false,
      canUseAdvancedFades: false,
      canUseLooping: false
    };
  }

  // Get demo user for testing
  getDemoUser(): StreamerUser {
    return this.DEMO_USER;
  }
}

export const authService = new AuthService();
export default authService;
