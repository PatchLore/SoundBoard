import React, { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
  clearDelay?: number;
}

const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  className = '',
  clearDelay = 5000
}) => {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      
      // Clear message after delay to prevent stale announcements
      const timeout = setTimeout(() => {
        setCurrentMessage('');
      }, clearDelay);

      return () => clearTimeout(timeout);
    }
  }, [message, clearDelay]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
      role="status"
    >
      {currentMessage}
    </div>
  );
};

// Hook for managing live region messages
export const useLiveRegion = (priority: 'polite' | 'assertive' = 'polite') => {
  const [message, setMessage] = useState('');

  const announce = (text: string) => {
    setMessage(text);
  };

  const announceFilterChange = (count: number, filterType?: string) => {
    const filterText = filterType ? ` ${filterType} filter` : ' filter';
    announce(`${count} tracks found with current${filterText}`);
  };

  const announceUploadProgress = (filename: string, progress: number) => {
    announce(`Uploading ${filename}: ${progress}% complete`);
  };

  const announceUploadComplete = (filename: string) => {
    announce(`${filename} uploaded successfully`);
  };

  const announceTrackPlayback = (trackTitle: string, action: 'playing' | 'paused' | 'stopped') => {
    const actionText = action === 'playing' ? 'now playing' : action === 'paused' ? 'paused' : 'stopped';
    announce(`${trackTitle} ${actionText}`);
  };

  const announceTrackAdded = (trackTitle: string, playlistName?: string) => {
    const destination = playlistName ? ` to ${playlistName}` : '';
    announce(`${trackTitle} added${destination}`);
  };

  const announceError = (errorMessage: string) => {
    announce(`Error: ${errorMessage}`);
  };

  return {
    message,
    announce,
    announceFilterChange,
    announceUploadProgress,
    announceUploadComplete,
    announceTrackPlayback,
    announceTrackAdded,
    announceError
  };
};

export default LiveRegion;



