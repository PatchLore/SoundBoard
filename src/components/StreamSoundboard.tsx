import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EnhancedMusicLibrary from './EnhancedMusicLibrary';
import authService from '../services/authService';

// This component is now a simple wrapper for the new EnhancedMusicLibrary
// All AI generation functionality has been removed
const StreamSoundboard: React.FC = () => {
  const [currentUser] = useState(() => authService.getCurrentUser());

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stream-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stream-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }}
    >
      <EnhancedMusicLibrary 
        userRole={{ 
          type: currentUser.userType, 
          permissions: [], 
          userId: currentUser.id || 'user' 
        }} 
      />
    </motion.div>
  );
};

export default StreamSoundboard;

