import React from 'react';
import { motion } from 'framer-motion';

interface ActiveFilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}

const ActiveFilterChip: React.FC<ActiveFilterChipProps> = ({ 
  label, 
  value, 
  onRemove, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        inline-flex items-center space-x-2 px-3 py-1.5 
        bg-stream-accent/20 text-stream-accent border border-stream-accent/30 
        rounded-full text-sm font-medium
        ${className}
      `}
    >
      <span className="truncate max-w-[120px]" title={`${label}: ${value}`}>
        {label}: {value}
      </span>
      <button
        onClick={onRemove}
        className="
          flex-shrink-0 w-5 h-5 rounded-full 
          hover:bg-stream-accent/30 
          flex items-center justify-center
          transition-colors duration-150
        "
        aria-label={`Remove ${label} filter`}
        title={`Remove ${label} filter`}
      >
        <span className="text-xs">×</span>
      </button>
    </motion.div>
  );
};

export default ActiveFilterChip;
