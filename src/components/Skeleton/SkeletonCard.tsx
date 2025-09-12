import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonCardProps {
  className?: string;
  variant?: 'track' | 'compact' | 'minimal';
  animate?: boolean;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  className = '', 
  variant = 'track',
  animate = true 
}) => {
  const baseClasses = "bg-stream-darker rounded-lg border border-stream-light/10 overflow-hidden";
  
  const variants = {
    track: "p-4 space-y-3",
    compact: "p-3 space-y-2", 
    minimal: "p-2 space-y-2"
  };

  const skeletonContent = () => {
    switch (variant) {
      case 'track':
        return (
          <>
            {/* Cover Image */}
            <div className="w-full h-32 bg-stream-gray/50 rounded-lg animate-pulse" />
            
            {/* Title */}
            <div className="space-y-2">
              <div className="h-4 bg-stream-gray/50 rounded animate-pulse" />
              <div className="h-3 bg-stream-gray/40 rounded w-3/4 animate-pulse" />
            </div>
            
            {/* Metadata */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="h-3 bg-stream-gray/40 rounded w-16 animate-pulse" />
                <div className="h-3 bg-stream-gray/40 rounded w-12 animate-pulse" />
              </div>
              <div className="flex space-x-2">
                <div className="h-3 bg-stream-gray/40 rounded w-20 animate-pulse" />
                <div className="h-3 bg-stream-gray/40 rounded w-14 animate-pulse" />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <div className="h-8 bg-stream-gray/50 rounded w-16 animate-pulse" />
              <div className="h-8 bg-stream-gray/50 rounded w-16 animate-pulse" />
              <div className="h-8 bg-stream-gray/50 rounded w-8 animate-pulse" />
            </div>
          </>
        );
        
      case 'compact':
        return (
          <>
            {/* Cover Image */}
            <div className="w-full h-24 bg-stream-gray/50 rounded animate-pulse" />
            
            {/* Title */}
            <div className="space-y-1">
              <div className="h-3 bg-stream-gray/50 rounded animate-pulse" />
              <div className="h-3 bg-stream-gray/40 rounded w-2/3 animate-pulse" />
            </div>
            
            {/* Metadata */}
            <div className="flex space-x-2">
              <div className="h-2 bg-stream-gray/40 rounded w-12 animate-pulse" />
              <div className="h-2 bg-stream-gray/40 rounded w-8 animate-pulse" />
            </div>
            
            {/* Action Button */}
            <div className="h-6 bg-stream-gray/50 rounded w-12 animate-pulse" />
          </>
        );
        
      case 'minimal':
        return (
          <>
            {/* Cover Image */}
            <div className="w-full h-16 bg-stream-gray/50 rounded animate-pulse" />
            
            {/* Title */}
            <div className="h-3 bg-stream-gray/50 rounded animate-pulse" />
            
            {/* Metadata */}
            <div className="h-2 bg-stream-gray/40 rounded w-1/2 animate-pulse" />
          </>
        );
        
      default:
        return null;
    }
  };

  const cardElement = (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {skeletonContent()}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3,
          ease: "easeOut"
        }}
      >
        {cardElement}
      </motion.div>
    );
  }

  return cardElement;
};

export default SkeletonCard;
