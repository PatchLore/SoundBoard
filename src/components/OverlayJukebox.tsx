import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import musicService from '../services/musicService';
import { StreamingTrack } from '../types/track';

const OverlayJukebox: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [playlist, setPlaylist] = useState<StreamingTrack[]>([]);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<StreamingTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(50);

  // Load demo tracks for now (will be replaced with manual uploads)
  useEffect(() => {
    const loadTracks = async () => {
      try {
        // For now, use demo tracks until manual uploads are implemented
        const demoTracks = musicService.getDemoTracks();
        setPlaylist(demoTracks);
        setShuffledPlaylist([...demoTracks].sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error('Failed to load tracks:', error);
        setPlaylist([]);
        setShuffledPlaylist([]);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  const currentPlaylist = isShuffled ? shuffledPlaylist : playlist;
  const currentTrack = currentPlaylist[currentTrackIndex];

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % currentPlaylist.length);
  };
  const handlePrevious = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + currentPlaylist.length) % currentPlaylist.length);
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentTrackIndex(0);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEnd = () => { setIsPlaying(false); handleNext(); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading curated tracks...</p>
        </div>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No tracks available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🎵 Music Jukebox</h1>
          <p className="text-gray-400">Perfect background music for your stream</p>
        </div>

        {/* Current Track Info */}
        <div className="bg-gray-800 rounded-3xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{currentTrack.title}</h2>
          <p className="text-gray-300 mb-4">{currentTrack.artist}</p>
          <p className="text-gray-400 mb-4">
            Duration: {currentTrack.duration} • Energy: {currentTrack.energy}
          </p>
          
          {/* Streaming Category */}
          <div className="mb-4">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full border border-blue-600/30">
              {currentTrack.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {currentTrack.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Audio Player Placeholder */}
          <div className="bg-gray-700 rounded-2xl p-4 mb-6">
            <p className="text-gray-400">🎵 Audio player will be implemented for manual uploads</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Previous */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            className="px-6 py-3 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-600"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </div>
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? handlePause : handlePlay}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:bg-blue-700"
          >
            <div className="flex items-center gap-2">
              {isPlaying ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Play
                </>
              )}
            </div>
          </motion.button>

          {/* Next */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="px-6 py-3 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-600"
          >
            <div className="flex items-center gap-2">
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        </div>

        {/* Additional Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Shuffle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShuffle}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
              isShuffled
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 border border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isShuffled ? 'Shuffle On' : 'Shuffle Off'}
            </div>
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center gap-3 bg-gray-700 px-4 py-3 rounded-2xl">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-500 text-center">{volume}%</div>
          </div>
        </div>

        {/* Playlist Info */}
        <div className="text-center text-gray-400">
          <p>Track {currentTrackIndex + 1} of {currentPlaylist.length}</p>
          <p className="text-sm mt-2">Demo Mode: Using sample tracks. Upload your own music in the main app!</p>
        </div>
      </div>
    </div>
  );
};

export default OverlayJukebox;

