import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../../types/track';
import { STREAMING_CATEGORIES } from '../../data/categories';
import trackManagementService from '../../services/trackManagementService';

interface TrackUploaderProps {
  onTrackUpload: (track: Track) => void;
  onClose: () => void;
}

const TrackUploader: React.FC<TrackUploaderProps> = ({ onTrackUpload, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [trackMetadata, setTrackMetadata] = useState<Partial<Track>>({
    title: '',
    artist: '',
    category: 'chill-gaming',
    subcategory: '',
    mood: 'chill',
    energy: 3,
    bpm: undefined,
    key: '',
    tags: [],
    description: '',
    streamSafe: true,
    loopFriendly: false,
    hasIntro: false,
    hasOutro: false,
    dmcaSafe: true,
    featured: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.includes('audio/')) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.type.includes('audio/')) {
      setUploadedFile(file);
      setTrackMetadata(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        artist: 'Unknown Artist'
      }));
      setShowMetadataForm(true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleMetadataChange = (field: keyof Track, value: any) => {
    setTrackMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setTrackMetadata(prev => ({ ...prev, tags }));
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload track using the service
      const newTrack = await trackManagementService.uploadTrack(trackMetadata, uploadedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Wait a bit to show completion
      setTimeout(() => {
        onTrackUpload(newTrack);
        onClose();
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setUploadedFile(null);
    setShowMetadataForm(false);
    setTrackMetadata({
      title: '',
      artist: '',
      category: 'chill-gaming',
      subcategory: '',
      mood: 'chill',
      energy: 3,
      bpm: undefined,
      key: '',
      tags: [],
      description: '',
      streamSafe: true,
      loopFriendly: false,
      hasIntro: false,
      hasOutro: false,
      dmcaSafe: true,
      featured: false
    });
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
          <h2 className="text-2xl font-bold text-white">📁 Upload New Track</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* File Upload Area */}
        {!showMetadataForm && (
          <motion.div
            className="border-2 border-dashed border-stream-light/30 rounded-xl p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragging ? 'Drop your audio file here' : 'Upload Audio Track'}
            </h3>
            <p className="text-gray-400 mb-6">
              Drag and drop your MP3 file here, or click to browse
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Choose File
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </motion.div>
        )}

        {/* Drag and Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging 
              ? 'border-stream-accent bg-stream-accent/10' 
              : 'border-stream-light/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <motion.div
              className="text-4xl text-stream-accent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            >
              📁
            </motion.div>
          )}
        </div>

        {/* Metadata Form */}
        <AnimatePresence>
          {showMetadataForm && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Track Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Basic Info */}
                <div>
                  <label htmlFor="track-title" className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    id="track-title"
                    type="text"
                    value={trackMetadata.title}
                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                    placeholder="Track title"
                  />
                </div>

                <div>
                  <label htmlFor="track-artist" className="block text-sm font-medium text-gray-300 mb-2">Artist *</label>
                  <input
                    id="track-artist"
                    type="text"
                    value={trackMetadata.artist}
                    onChange={(e) => handleMetadataChange('artist', e.target.value)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                    placeholder="Artist name"
                  />
                </div>

                {/* Category and Subcategory */}
                <div>
                  <label htmlFor="track-category" className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    id="track-category"
                    value={trackMetadata.category}
                    onChange={(e) => handleMetadataChange('category', e.target.value)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
                  >
                    {STREAMING_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="track-subcategory" className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
                  <input
                    id="track-subcategory"
                    type="text"
                    value={trackMetadata.subcategory}
                    onChange={(e) => handleMetadataChange('subcategory', e.target.value)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                    placeholder="e.g., orchestral, electronic"
                  />
                </div>

                {/* Mood and Energy */}
                <div>
                  <label htmlFor="track-mood" className="block text-sm font-medium text-gray-300 mb-2">Mood *</label>
                  <select
                    id="track-mood"
                    value={trackMetadata.mood}
                    onChange={(e) => handleMetadataChange('mood', e.target.value)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
                  >
                    <option value="chill">Chill</option>
                    <option value="epic">Epic</option>
                    <option value="energetic">Energetic</option>
                    <option value="mysterious">Mysterious</option>
                    <option value="uplifting">Uplifting</option>
                    <option value="dark">Dark</option>
                    <option value="peaceful">Peaceful</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="track-energy" className="block text-sm font-medium text-gray-300 mb-2">Energy Level *</label>
                  <select
                    id="track-energy"
                    value={trackMetadata.energy}
                    onChange={(e) => handleMetadataChange('energy', parseInt(e.target.value))}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
                  >
                    <option value={1}>1 ⭐ Very Chill</option>
                    <option value={2}>2 ⭐⭐ Chill</option>
                    <option value={3}>3 ⭐⭐⭐ Medium</option>
                    <option value={4}>4 ⭐⭐⭐⭐ Energetic</option>
                    <option value={5}>5 ⭐⭐⭐⭐⭐ High Energy</option>
                  </select>
                </div>

                {/* BPM and Key */}
                <div>
                  <label htmlFor="track-bpm" className="block text-sm font-medium text-gray-300 mb-2">BPM</label>
                  <input
                    id="track-bpm"
                    type="number"
                    value={trackMetadata.bpm || ''}
                    onChange={(e) => handleMetadataChange('bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                    placeholder="e.g., 120"
                    min="60"
                    max="200"
                  />
                </div>

                <div>
                  <label htmlFor="track-key" className="block text-sm font-medium text-gray-300 mb-2">Musical Key</label>
                  <input
                    id="track-key"
                    type="text"
                    value={trackMetadata.key}
                    onChange={(e) => handleMetadataChange('key', e.target.value)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                    placeholder="e.g., C major, A minor"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label htmlFor="track-tags" className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <input
                  id="track-tags"
                  type="text"
                  value={trackMetadata.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                  placeholder="epic, orchestral, battle, intense (comma separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="track-description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  id="track-description"
                  value={trackMetadata.description || ''}
                  onChange={(e) => handleMetadataChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none resize-none"
                  placeholder="Describe the track's style, mood, and intended use..."
                />
              </div>

              {/* Track Properties */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={trackMetadata.streamSafe}
                    onChange={(e) => handleMetadataChange('streamSafe', e.target.checked)}
                    className="rounded border-stream-light/20 text-stream-accent focus:ring-stream-accent"
                  />
                  <span className="text-sm text-gray-300">Stream Safe</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={trackMetadata.loopFriendly}
                    onChange={(e) => handleMetadataChange('loopFriendly', e.target.checked)}
                    className="rounded border-stream-light/20 text-stream-accent focus:ring-stream-accent"
                  />
                  <span className="text-sm text-gray-300">Loop Friendly</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={trackMetadata.hasIntro}
                    onChange={(e) => handleMetadataChange('hasIntro', e.target.checked)}
                    className="rounded border-stream-light/20 text-stream-accent focus:ring-stream-accent"
                  />
                  <span className="text-sm text-gray-300">Has Intro</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={trackMetadata.hasOutro}
                    onChange={(e) => handleMetadataChange('hasOutro', e.target.checked)}
                    className="rounded border-stream-light/20 text-stream-accent focus:ring-stream-accent"
                  />
                  <span className="text-sm text-gray-300">Has Outro</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={trackMetadata.dmcaSafe}
                    onChange={(e) => handleMetadataChange('dmcaSafe', e.target.checked)}
                    className="rounded border-stream-light/20 text-stream-accent focus:ring-stream-accent"
                  />
                  <span className="text-sm text-gray-300">DMCA Safe</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={trackMetadata.featured}
                    onChange={(e) => handleMetadataChange('featured', e.target.checked)}
                    className="rounded border-stream-light/20 text-stream-accent focus:ring-stream-accent"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
                </label>
              </div>

              {/* Audio Preview */}
              {uploadedFile && (
                <div className="mb-6 p-4 bg-stream-gray rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Audio Preview</h4>
                  <audio
                    ref={audioRef}
                    controls
                    className="w-full"
                    src={URL.createObjectURL(uploadedFile)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    File: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Uploading...</span>
                    <span className="text-sm text-gray-300">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-stream-gray rounded-full h-2">
                    <div
                      className="bg-stream-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isUploading}
                >
                  Reset
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleUpload}
                    disabled={!uploadedFile || !trackMetadata.title || !trackMetadata.artist || isUploading}
                    className="px-6 py-2 bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Track'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default TrackUploader;
