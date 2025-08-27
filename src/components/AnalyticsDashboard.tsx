import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

interface AnalyticsData {
  sessionId: string;
  events: any[];
  performanceMetrics: any;
  userInteractions: any[];
  errors: any[];
  performanceIssues: any[];
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const loadAnalyticsData = () => {
    const events = analyticsService.getEvents();
    const sessionId = analyticsService.getSessionId();
    
    const userInteractions = events.filter(e => e.event === 'user_interaction');
    const errors = events.filter(e => e.event === 'error');
    const performanceIssues = events.filter(e => e.event === 'performance_issue');
    const appLoads = events.filter(e => e.event === 'app_load');

    setAnalyticsData({
      sessionId,
      events,
      performanceMetrics: appLoads[0]?.data || {},
      userInteractions,
      errors,
      performanceIssues
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (ms: number) => {
    return `${ms.toFixed(0)}ms`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 w-80 bg-gray-900 border border-gray-600 rounded-lg shadow-xl z-50">
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">📊 Analytics Dashboard</h3>
          <button
            onClick={loadAnalyticsData}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-1">Development Mode Only</p>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {analyticsData ? (
          <div className="space-y-4">
            {/* Session Info */}
            <div className="bg-gray-800 p-3 rounded">
              <h4 className="text-white font-medium mb-2">Session Info</h4>
              <div className="text-xs text-gray-300">
                <div>Session ID: {analyticsData.sessionId}</div>
                <div>Total Events: {analyticsData.events.length}</div>
                <div>User Interactions: {analyticsData.userInteractions.length}</div>
                <div>Errors: {analyticsData.errors.length}</div>
                <div>Performance Issues: {analyticsData.performanceIssues.length}</div>
              </div>
            </div>

            {/* Performance Metrics */}
            {analyticsData.performanceMetrics && (
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-white font-medium mb-2">Performance Metrics</h4>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>JSON Load: {formatDuration(analyticsData.performanceMetrics.jsonLoadTime || 0)}</div>
                  <div>Processing: {formatDuration(analyticsData.performanceMetrics.trackProcessingTime || 0)}</div>
                  <div>Total Load: {formatDuration(analyticsData.performanceMetrics.totalLoadTime || 0)}</div>
                  <div>Memory: {((analyticsData.performanceMetrics.memoryUsage || 0) / 1024 / 1024).toFixed(1)}MB</div>
                  <div>Tracks Loaded: {analyticsData.performanceMetrics.tracksLoaded || 0}</div>
                  <div>Load Success: {analyticsData.performanceMetrics.loadSuccess ? '✅' : '❌'}</div>
                </div>
              </div>
            )}

            {/* Recent User Interactions */}
            {analyticsData.userInteractions.length > 0 && (
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-white font-medium mb-2">Recent Interactions</h4>
                <div className="space-y-2">
                  {analyticsData.userInteractions.slice(-3).map((interaction, index) => (
                    <div key={index} className="text-xs text-gray-300 border-l-2 border-blue-500 pl-2">
                      <div className="font-medium">{interaction.data.interaction}</div>
                      <div className="text-gray-400">{formatTime(interaction.timestamp)}</div>
                      {interaction.data.data && (
                        <div className="text-gray-500">
                          {Object.entries(interaction.data.data).map(([key, value]) => (
                            <span key={key} className="mr-2">{key}: {String(value)}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {analyticsData.errors.length > 0 && (
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-white font-medium mb-2">Errors</h4>
                <div className="space-y-2">
                  {analyticsData.errors.slice(-3).map((error, index) => (
                    <div key={index} className="text-xs text-red-300 border-l-2 border-red-500 pl-2">
                      <div className="font-medium">{error.data.type}</div>
                      <div className="text-red-400">{error.data.message}</div>
                      <div className="text-gray-400">{formatTime(error.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Issues */}
            {analyticsData.performanceIssues.length > 0 && (
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-white font-medium mb-2">Performance Issues</h4>
                <div className="space-y-2">
                  {analyticsData.performanceIssues.slice(-3).map((issue, index) => (
                    <div key={index} className="text-xs text-yellow-300 border-l-2 border-yellow-500 pl-2">
                      <div className="font-medium">{issue.data.type}</div>
                      <div className="text-yellow-400">{issue.data.details}</div>
                      <div className="text-gray-400">{formatTime(issue.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Click "Refresh" to load analytics data</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-600">
        <button
          onClick={() => analyticsService.flushEvents()}
          className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Flush Events
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
