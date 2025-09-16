import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../types/track';

interface TrackGroupProps {
  title: string;
  count: number;
  tracks: Track[];
  renderTrack: (track: Track, index: number) => React.ReactNode;
  defaultCollapsed?: boolean;
  emptyMessage?: string;
  className?: string;
}

const TrackGroup: React.FC<TrackGroupProps> = ({
  title,
  count,
  tracks,
  renderTrack,
  defaultCollapsed = true,
  emptyMessage = "No tracks in this group",
  className = ""
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {/* Group Header */}
      <button
        onClick={toggleCollapsed}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <motion.span
            animate={{ rotate: isCollapsed ? 0 : 90 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            ▶
          </motion.span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-sm rounded-full">
            {count}
          </span>
        </div>
        <div className="text-gray-400 text-sm">
          {isCollapsed ? 'Click to expand' : 'Click to collapse'}
        </div>
      </button>

      {/* Group Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-700 p-4">
              {tracks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🎵</div>
                  <p>{emptyMessage}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tracks.map((track, index) => (
                    <div key={track.id}>
                      {renderTrack(track, index)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackGroup;



