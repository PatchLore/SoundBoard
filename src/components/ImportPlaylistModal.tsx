import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../types/track';

interface ImportPlaylistModalProps {
  onClose: () => void;
  onImportComplete: (tracks: Track[]) => void;
}

const ImportPlaylistModal: React.FC<ImportPlaylistModalProps> = ({ onClose, onImportComplete }) => {
  const [importType, setImportType] = useState<'spotify' | 'youtube' | 'file' | 'url'>('spotify');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistFile, setPlaylistFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleImport = async () => {
    if (!playlistUrl && !playlistFile) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate import progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create sample tracks based on import type
      const sampleTracks: Track[] = [
        {
          id: `import_${Date.now()}_1`,
          title: 'Imported Track 1',
          artist: 'Playlist Import',
          duration: 180,
          audioUrl: '/tracks/sample-import-1.mp3',
          category: 'chill-gaming',
          subcategory: 'imported',
          mood: 'chill',
          energy: 2,
          bpm: 80,
          key: 'C major',
          tags: ['imported', 'playlist'],
          description: 'Imported from external playlist',
          streamSafe: true,
          loopFriendly: true,
          hasIntro: false,
          hasOutro: false,
          dmcaSafe: true,
          uploadDate: new Date().toISOString(),
          uploadedBy: 'playlist-import',
          approved: true,
          featured: false,
          usageTracking: {
            usageCount: 0,
            lastUsed: undefined
          }
        },
        {
          id: `import_${Date.now()}_2`,
          title: 'Imported Track 2',
          artist: 'Playlist Import',
          duration: 240,
          audioUrl: '/tracks/sample-import-2.mp3',
          category: 'gaming-action',
          subcategory: 'imported',
          mood: 'energetic',
          energy: 4,
          bpm: 120,
          key: 'D minor',
          tags: ['imported', 'playlist', 'gaming'],
          description: 'Imported from external playlist',
          streamSafe: true,
          loopFriendly: false,
          hasIntro: true,
          hasOutro: false,
          dmcaSafe: true,
          uploadDate: new Date().toISOString(),
          uploadedBy: 'playlist-import',
          approved: true,
          featured: false,
          usageTracking: {
            usageCount: 0,
            lastUsed: undefined
          }
        }
      ];

      clearInterval(progressInterval);
      setImportProgress(100);

      // Wait a bit to show completion
      setTimeout(() => {
        onImportComplete(sampleTracks);
      }, 500);

    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPlaylistFile(file);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-stream-darker rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🎵 Import Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Import Type Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Import Source</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'spotify', label: 'Spotify', icon: '🎵' },
              { id: 'youtube', label: 'YouTube', icon: '📺' },
              { id: 'file', label: 'File Upload', icon: '📁' },
              { id: 'url', label: 'URL', icon: '🔗' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setImportType(type.id as any)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  importType === type.id
                    ? 'border-stream-accent bg-stream-accent/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-white font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Import Input */}
        <div className="mb-6">
          {importType === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Playlist File
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-400 mb-3">
                  Upload M3U, PLS, or TXT playlist file
                </p>
                <input
                  type="file"
                  accept=".m3u,.m3u8,.pls,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="playlist-file"
                />
                <label
                  htmlFor="playlist-file"
                  className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  Choose File
                </label>
                {playlistFile && (
                  <p className="text-white mt-2">Selected: {playlistFile.name}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {importType === 'spotify' ? 'Spotify Playlist URL' :
                 importType === 'youtube' ? 'YouTube Playlist URL' : 'Playlist URL'}
              </label>
              <input
                type="url"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder={`Enter ${importType} playlist URL...`}
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Import Progress */}
        {isImporting && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Importing...</span>
              <span className="text-gray-400">{importProgress}%</span>
            </div>
            <div className="w-full bg-stream-gray rounded-full h-2">
              <div
                className="bg-stream-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={(!playlistUrl && !playlistFile) || isImporting}
            className="flex-1 px-4 py-3 bg-stream-accent hover:bg-stream-accent/90 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isImporting ? 'Importing...' : 'Import Playlist'}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-stream-gray rounded-lg">
          <p className="text-sm text-gray-400">
            <strong>Note:</strong> This is a demo feature. In production, this would connect to actual APIs 
            and import real tracks from the selected source.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImportPlaylistModal;
