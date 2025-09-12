// Analytics service for tracking real user performance data
export interface PerformanceMetrics {
  // Navigation timing
  navigationStart: number;
  loadEventEnd: number;
  domContentLoadedEventEnd: number;
  
  // Resource loading
  jsonLoadTime: number;
  trackProcessingTime: number;
  totalLoadTime: number;
  
  // Memory usage
  memoryUsage: number;
  memoryLimit: number;
  
  // User interaction
  timeToInteractive: number;
  firstContentfulPaint: number;
  
  // Device info
  userAgent: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  
  // App-specific metrics
  tracksLoaded: number;
  totalTracks: number;
  loadSuccess: boolean;
  errorType?: string;
}

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  data: any;
  sessionId: string;
}

class AnalyticsService {
  private sessionId: string;
  private isProduction: boolean;
  private analyticsEndpoint: string;
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: Partial<PerformanceMetrics> = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.analyticsEndpoint = process.env.REACT_APP_ANALYTICS_ENDPOINT || '';
    
    // Track in both production and development for testing
    this.initializePerformanceTracking();
    
    // Add sample data for development/testing
    if (!this.isProduction) {
      this.addSampleData();
    }
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private addSampleData() {
    // Add sample performance metrics
    this.performanceMetrics = {
      jsonLoadTime: 125,
      trackProcessingTime: 340,
      totalLoadTime: 465,
      memoryUsage: 45 * 1024 * 1024, // 45MB
      tracksLoaded: 12,
      totalTracks: 15,
      loadSuccess: true,
      timeToInteractive: 1200,
      firstContentfulPaint: 800
    };

    // Add sample events
    this.events = [
      {
        event: 'app_load',
        timestamp: Date.now() - 300000, // 5 minutes ago
        sessionId: this.sessionId,
        data: this.performanceMetrics
      },
      {
        event: 'user_interaction',
        timestamp: Date.now() - 240000, // 4 minutes ago
        sessionId: this.sessionId,
        data: {
          interaction: 'track_play',
          data: { trackId: 'track_001', trackName: 'Epic Boss Battle' }
        }
      },
      {
        event: 'user_interaction',
        timestamp: Date.now() - 180000, // 3 minutes ago
        sessionId: this.sessionId,
        data: {
          interaction: 'track_pause',
          data: { trackId: 'track_001', trackName: 'Epic Boss Battle' }
        }
      },
      {
        event: 'user_interaction',
        timestamp: Date.now() - 120000, // 2 minutes ago
        sessionId: this.sessionId,
        data: {
          interaction: 'category_filter',
          data: { category: 'gaming-action', filterCount: 8 }
        }
      },
      {
        event: 'user_interaction',
        timestamp: Date.now() - 60000, // 1 minute ago
        sessionId: this.sessionId,
        data: {
          interaction: 'volume_change',
          data: { volume: 75, previousVolume: 60 }
        }
      }
    ];
  }

  private initializePerformanceTracking() {
    // Track navigation timing
    if (performance.timing) {
      this.performanceMetrics.navigationStart = performance.timing.navigationStart;
      this.performanceMetrics.loadEventEnd = performance.timing.loadEventEnd;
      this.performanceMetrics.domContentLoadedEventEnd = performance.timing.domContentLoadedEventEnd;
    }

    // Track modern performance metrics
    if ('getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        this.performanceMetrics.timeToInteractive = navEntry.domInteractive;
        this.performanceMetrics.firstContentfulPaint = (navEntry as any).firstContentfulPaint || 0;
      }
    }

    // Track device capabilities
    this.performanceMetrics.userAgent = navigator.userAgent;
    this.performanceMetrics.platform = navigator.platform;
    this.performanceMetrics.hardwareConcurrency = navigator.hardwareConcurrency || 0;
    this.performanceMetrics.deviceMemory = (navigator as any).deviceMemory || 0;

    // Track memory usage
    if ((performance as any).memory) {
      this.performanceMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
      this.performanceMetrics.memoryLimit = (performance as any).memory.jsHeapSizeLimit;
    }
  }

  public trackAppLoad(metrics: {
    jsonLoadTime: number;
    trackProcessingTime: number;
    totalLoadTime: number;
    tracksLoaded: number;
    totalTracks: number;
    loadSuccess: boolean;
    errorType?: string;
  }) {
    if (!this.isProduction || !this.analyticsEndpoint) {
      console.log('📊 Analytics (dev): App load tracked', metrics);
      return;
    }

    const event: AnalyticsEvent = {
      event: 'app_load',
      timestamp: Date.now(),
      data: {
        ...this.performanceMetrics,
        ...metrics,
        sessionId: this.sessionId
      },
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendAnalytics(event);
  }

  public trackUserInteraction(interaction: string, data?: any) {
    if (!this.isProduction || !this.analyticsEndpoint) {
      console.log('📊 Analytics (dev): User interaction tracked', { interaction, data });
      return;
    }

    const event: AnalyticsEvent = {
      event: 'user_interaction',
      timestamp: Date.now(),
      data: {
        interaction,
        data,
        sessionId: this.sessionId,
        ...this.performanceMetrics
      },
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendAnalytics(event);
  }

  public trackPerformanceIssue(issue: {
    type: 'slow_loading' | 'memory_high' | 'timeout' | 'error';
    details: string;
    metrics: any;
  }) {
    if (!this.isProduction || !this.analyticsEndpoint) {
      console.log('📊 Analytics (dev): Performance issue tracked', issue);
      return;
    }

    const event: AnalyticsEvent = {
      event: 'performance_issue',
      timestamp: Date.now(),
      data: {
        ...issue,
        sessionId: this.sessionId,
        ...this.performanceMetrics
      },
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendAnalytics(event);
  }

  public trackError(error: {
    type: string;
    message: string;
    stack?: string;
    context?: any;
  }) {
    if (!this.isProduction || !this.analyticsEndpoint) {
      console.log('📊 Analytics (dev): Error tracked', error);
      return;
    }

    const event: AnalyticsEvent = {
      event: 'error',
      timestamp: Date.now(),
      data: {
        ...error,
        sessionId: this.sessionId,
        ...this.performanceMetrics
      },
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendAnalytics(event);
  }

  private async sendAnalytics(event: AnalyticsEvent) {
    try {
      // Send to your analytics endpoint
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      // Also send to Google Analytics if configured
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', event.event, {
          event_category: 'performance',
          event_label: event.sessionId,
          value: event.timestamp,
          custom_parameters: event.data
        });
      }

      // Send to console in development
      if (!this.isProduction) {
        console.log('📊 Analytics sent:', event);
      }

    } catch (error) {
      // Don't let analytics errors break the app
      console.warn('Analytics send failed:', error);
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  public getPerformanceMetrics(): Partial<PerformanceMetrics> {
    return { ...this.performanceMetrics };
  }

  public flushEvents() {
    // Send all pending events
    this.events.forEach(event => this.sendAnalytics(event));
    this.events = [];
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Export for use in components
export default analyticsService;
