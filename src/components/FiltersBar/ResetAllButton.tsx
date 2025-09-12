import React from 'react';
import { motion } from 'framer-motion';

interface ResetAllButtonProps {
  onReset: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

const ResetAllButton: React.FC<ResetAllButtonProps> = ({ 
  onReset, 
  hasActiveFilters, 
  className = '' 
}) => {
  return (
    <motion.button
      onClick={onReset}
      disabled={!hasActiveFilters}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${hasActiveFilters 
          ? 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 hover:text-red-300' 
          : 'bg-gray-600/20 text-gray-500 border border-gray-600/30 cursor-not-allowed'
        }
        ${className}
      `}
      whileHover={hasActiveFilters ? { scale: 1.02 } : {}}
      whileTap={hasActiveFilters ? { scale: 0.98 } : {}}
      aria-label="Reset all filters"
      title={hasActiveFilters ? "Clear all active filters" : "No filters to reset"}
    >
      <span className="flex items-center space-x-2">
        <span>🔄</span>
        <span>Reset All</span>
      </span>
    </motion.button>
  );
};

export default ResetAllButton;
