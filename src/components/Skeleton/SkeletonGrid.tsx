import React from 'react';
import { motion } from 'framer-motion';
import SkeletonCard from './SkeletonCard';

interface SkeletonGridProps {
  count?: number;
  columns?: number;
  variant?: 'track' | 'compact' | 'minimal';
  className?: string;
  animate?: boolean;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 8,
  columns = 4,
  variant = 'track',
  className = '',
  animate = true
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const skeletonCards = Array.from({ length: count }, (_, index) => (
    <SkeletonCard
      key={index}
      variant={variant}
      animate={animate}
    />
  ));

  const gridElement = (
    <div className={`grid gap-6 ${gridClasses[columns as keyof typeof gridClasses] || gridClasses[4]} ${className}`}>
      {skeletonCards}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.4,
          ease: "easeOut",
          staggerChildren: 0.1
        }}
      >
        {gridElement}
      </motion.div>
    );
  }

  return gridElement;
};

export default SkeletonGrid;
