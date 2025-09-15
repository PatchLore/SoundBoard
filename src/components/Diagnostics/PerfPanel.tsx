import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../../types/track';

interface PerfMetrics {
  trackCount: number;
  apiResponseTimes: number[];
  lastLoadMoreBatchSize: number;
  lastLoadMoreTime: number;
  memoryUsage: number;
  renderTime: number;
}

interface PerfPanelProps {
  tracks: Track[];
  isVisible?: boolean;
  onToggle?: () => void;
}

const PerfPanel: React.FC<PerfPanelProps> = ({ 
  tracks, 
  isVisible = false, 
  onToggle 
}) => {
  const [metrics, setMetrics] = useState<PerfMetrics>({
    trackCount: 0,
    apiResponseTimes: [],
    lastLoadMoreBatchSize: 0,
    lastLoadMoreTime: 0,
    memoryUsage: 0,
    renderTime: 0
  });

  const [isMinimized, setIsMinimized] = useState(false);

  // Update track count when tracks change
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      trackCount: tracks.length
    }));
  }, [tracks]);

  // Sample API response times (mock implementation)
  const sampleApiResponseTime = useCallback(() => {
    // Simulate API response time measurement
    const responseTime = Math.random() * 1000 + 100; // 100-1100ms
    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: [...prev.apiResponseTimes.slice(-9), responseTime] // Keep last 10
    }));
  }, []);

  // Update load more metrics
  const updateLoadMoreMetrics = useCallback((batchSize: number) => {
    const loadTime = performance.now();
    setMetrics(prev => ({
      ...prev,
      lastLoadMoreBatchSize: batchSize,
      lastLoadMoreTime: loadTime
    }));
  }, []);

  // Measure memory usage (if available)
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      setMetrics(prev => ({
        ...prev,
        memoryUsage: usedMB
      }));
    }
  }, []);

  // Measure render time
  const measureRenderTime = useCallback(() => {
    const renderStart = performance.now();
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.round(renderEnd - renderStart)
      }));
    });
  }, []);

  // Sample metrics periodically
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      sampleApiResponseTime();
      measureMemoryUsage();
      measureRenderTime();
    }, 2000); // Sample every 2 seconds

    return () => clearInterval(interval);
  }, [isVisible, sampleApiResponseTime, measureMemoryUsage, measureRenderTime]);

  // Expose updateLoadMoreMetrics for external use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).updateLoadMoreMetrics = updateLoadMoreMetrics;
    }
  }, [updateLoadMoreMetrics]);

  const getAverageResponseTime = () => {
    if (metrics.apiResponseTimes.length === 0) return 0;
    return Math.round(
      metrics.apiResponseTimes.reduce((sum, time) => sum + time, 0) / 
      metrics.apiResponseTimes.length
    );
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 300) return 'text-green-400';
    if (time < 600) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-400';
    if (memory < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isVisible) {
    return (
      <motion.button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-all duration-200 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Show Performance Diagnostics"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-w-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-3">
                {/* Track Count */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Tracks in Memory</span>
                  <span className="text-sm font-medium text-white">
                    {metrics.trackCount.toLocaleString()}
                  </span>
                </div>

                {/* API Response Times */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Avg API Response</span>
                  <span className={`text-sm font-medium ${getResponseTimeColor(getAverageResponseTime())}`}>
                    {getAverageResponseTime()}ms
                  </span>
                </div>

                {/* Last Load More */}
                {metrics.lastLoadMoreBatchSize > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Last Load More</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {metrics.lastLoadMoreBatchSize} tracks
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(metrics.lastLoadMoreTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Memory Usage */}
                {metrics.memoryUsage > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Memory Usage</span>
                    <span className={`text-sm font-medium ${getMemoryColor(metrics.memoryUsage)}`}>
                      {metrics.memoryUsage}MB
                    </span>
                  </div>
                )}

                {/* Render Time */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Render Time</span>
                  <span className={`text-sm font-medium ${getResponseTimeColor(metrics.renderTime)}`}>
                    {metrics.renderTime}ms
                  </span>
                </div>

                {/* Response Time Chart */}
                {metrics.apiResponseTimes.length > 0 && (
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Response Times</span>
                      <span className="text-xs text-gray-500">
                        {metrics.apiResponseTimes.length}/10 samples
                      </span>
                    </div>
                    <div className="flex items-end space-x-1 h-8">
                      {metrics.apiResponseTimes.slice(-10).map((time, index) => (
                        <div
                          key={index}
                          className={`flex-1 rounded-sm ${
                            time < 300 ? 'bg-green-500' : 
                            time < 600 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{
                            height: `${Math.min((time / 1000) * 100, 100)}%`
                          }}
                          title={`${Math.round(time)}ms`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default PerfPanel;






