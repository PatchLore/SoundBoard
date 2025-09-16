import React from 'react';

interface SourceLabelProps {
  source: 'client' | 'streamer';
  className?: string;
}

const SourceLabel: React.FC<SourceLabelProps> = ({ source, className = '' }) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors";
  
  const sourceClasses = source === 'client' 
    ? "bg-blue-900/20 text-blue-400 border border-blue-500/30" 
    : "bg-purple-900/20 text-purple-400 border border-purple-500/30";
  
  const labelText = source === 'client' ? 'Client' : 'Streamer';
  
  return (
    <span className={`${baseClasses} ${sourceClasses} ${className}`}>
      {labelText}
    </span>
  );
};

export default SourceLabel;



