import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../../types/track';
import { STREAMING_CATEGORIES } from '../../data/categories';
import trackManagementService from '../../services/trackManagementService';
import { useAuth } from '../../hooks/useAuth';

interface TrackUploaderProps {
  onTrackUpload: (track: Track) => void;
  onClose: () => void;
}

const TrackUploader: React.FC<TrackUploaderProps> = ({ onTrackUpload, onClose }) => {
  const { user, isAgency } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
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

  // Hide UI unless user is authenticated and has agency role
  if (!user || !isAgency) {
    return null; // Don't render uploader for unauthorized users
  }

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'title':
        if (!value || value.trim().length === 0) return 'Title is required';
        if (value.trim().length < 2) return 'Title must be at least 2 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        break;
      case 'artist':
        if (!value || value.trim().length === 0) return 'Artist is required';
        if (value.trim().length < 2) return 'Artist must be at least 2 characters';
        if (value.trim().length > 50) return 'Artist must be less than 50 characters';
        break;
      case 'bpm':
        if (value && (value < 60 || value > 200)) return 'BPM must be between 60 and 200';
        break;
      case 'tags':
        if (value && value.length > 10) return 'Maximum 10 tags allowed';
        break;
      case 'description':
        if (value && value.length > 500) return 'Description must be less than 500 characters';
        break;
    }
    return '';
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    const requiredFields = ['title', 'artist'];
    requiredFields.forEach(field => {
      const error = validateField(field, trackMetadata[field as keyof Track]);
      if (error) errors[field] = error;
    });

    // Validate optional fields if they have values
    if (trackMetadata.bpm) {
      const error = validateField('bpm', trackMetadata.bpm);
      if (error) errors.bpm = error;
    }

    if (trackMetadata.tags && trackMetadata.tags.length > 0) {
      const error = validateField('tags', trackMetadata.tags);
      if (error) errors.tags = error;
    }

    if (trackMetadata.description) {
      const error = validateField('description', trackMetadata.description);
      if (error) errors.description = error;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = (file: File) => {
    // Clear previous validation errors
    setValidationErrors({});
    
    if (!file.type.includes('audio/')) {
      setValidationErrors({ file: 'Please select a valid audio file (MP3, WAV, OGG, M4A)' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setValidationErrors({ file: 'File size must be less than 50MB' });
      return;
    }

      setUploadedFile(file);
      setTrackMetadata(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        artist: 'Unknown Artist'
      }));
      setShowMetadataForm(true);
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

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setTrackMetadata(prev => ({ ...prev, tags }));
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    // Validate form before upload
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('metadata', JSON.stringify(trackMetadata));

      // Upload to backend API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Create track object for local storage
      const newTrack: Track = {
        ...trackMetadata,
        id: Date.now().toString(),
        audioUrl: URL.createObjectURL(uploadedFile), // Local preview
        duration: 0, // Will be calculated
        uploadDate: new Date().toISOString(),
        uploadedBy: user?.email || 'unknown',
        approved: true,
        usageTracking: {
          usageCount: 0,
          lastUsed: undefined
        }
      } as Track;

      // Save to local storage using the existing uploadTrack method
      await trackManagementService.uploadTrack(trackMetadata, uploadedFile);
      
      setUploadProgress(100);

      // Show success toast
      setShowSuccessToast(true);
      
      // Wait a bit to show completion, then close
      setTimeout(() => {
        onTrackUpload(newTrack);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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


        {/* File Validation Error */}
        {validationErrors.file && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-400 text-sm flex items-center">
              <span className="mr-2">⚠️</span>
              {validationErrors.file}
            </p>
          </motion.div>
        )}

        {/* Enhanced Drag and Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-stream-accent bg-stream-accent/10 scale-105 shadow-lg shadow-stream-accent/20' 
              : validationErrors.file
              ? 'border-red-500 bg-red-900/10'
              : 'border-stream-light/30 hover:border-stream-light/50 hover:bg-stream-gray/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.div
                key="dragging"
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="text-6xl text-stream-accent mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  📁
                </motion.div>
                <motion.p
                  className="text-xl font-semibold text-stream-accent"
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Drop your audio file here!
                </motion.p>
                <motion.p
                  className="text-sm text-gray-400 mt-2"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Supported formats: MP3, WAV, OGG, M4A (up to 50MB)
                </motion.p>
              </motion.div>
            ) : (
          <motion.div
                key="idle"
                className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
          >
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-white mb-2">
                  Upload Audio Track
            </h3>
            <p className="text-gray-400 mb-6">
              Drag and drop your MP3 file here, or click to browse
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
                  className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
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
          </AnimatePresence>
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
                  <label htmlFor="track-title" className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                    <span className="text-xs text-gray-500 ml-2">(2-100 characters)</span>
                  </label>
                  <input
                    id="track-title"
                    type="text"
                    value={trackMetadata.title}
                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                    className={`w-full bg-stream-gray border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none transition-colors ${
                      validationErrors.title 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-stream-light/20 focus:border-stream-accent'
                    }`}
                    placeholder="Track title"
                  />
                  {validationErrors.title && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center"
                    >
                      <span className="mr-1">⚠️</span>
                      {validationErrors.title}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="track-artist" className="block text-sm font-medium text-gray-300 mb-2">
                    Artist *
                    <span className="text-xs text-gray-500 ml-2">(2-50 characters)</span>
                  </label>
                  <input
                    id="track-artist"
                    type="text"
                    value={trackMetadata.artist}
                    onChange={(e) => handleMetadataChange('artist', e.target.value)}
                    className={`w-full bg-stream-gray border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none transition-colors ${
                      validationErrors.artist 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-stream-light/20 focus:border-stream-accent'
                    }`}
                    placeholder="Artist name"
                  />
                  {validationErrors.artist && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center"
                    >
                      <span className="mr-1">⚠️</span>
                      {validationErrors.artist}
                    </motion.p>
                  )}
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
                  <label htmlFor="track-subcategory" className="block text-sm font-medium text-gray-300 mb-2">
                    Subcategory
                    <span className="text-xs text-gray-500 ml-2" title="More specific genre or style">ℹ️</span>
                  </label>
                  <input
                    id="track-subcategory"
                    type="text"
                    value={trackMetadata.subcategory}
                    onChange={(e) => handleMetadataChange('subcategory', e.target.value)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                    placeholder="e.g., orchestral, electronic, ambient"
                  />
                  <p className="text-xs text-gray-500 mt-1">Helps with better organization and search</p>
                </div>

                {/* Mood and Energy */}
                <div>
                  <label htmlFor="track-mood" className="block text-sm font-medium text-gray-300 mb-2">
                    Mood *
                    <span className="text-xs text-gray-500 ml-2" title="Overall emotional feel of the track">ℹ️</span>
                  </label>
                  <select
                    id="track-mood"
                    value={trackMetadata.mood}
                    onChange={(e) => handleMetadataChange('mood', e.target.value)}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
                  >
                    <option value="chill">Chill - Relaxing and calm</option>
                    <option value="epic">Epic - Grand and dramatic</option>
                    <option value="energetic">Energetic - High energy and upbeat</option>
                    <option value="mysterious">Mysterious - Intriguing and suspenseful</option>
                    <option value="uplifting">Uplifting - Positive and inspiring</option>
                    <option value="dark">Dark - Intense and foreboding</option>
                    <option value="peaceful">Peaceful - Serene and tranquil</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="track-energy" className="block text-sm font-medium text-gray-300 mb-2">
                    Energy Level *
                    <span className="text-xs text-gray-500 ml-2" title="Intensity level from 1 (very calm) to 5 (very intense)">ℹ️</span>
                  </label>
                  <select
                    id="track-energy"
                    value={trackMetadata.energy}
                    onChange={(e) => handleMetadataChange('energy', parseInt(e.target.value))}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
                  >
                    <option value={1}>1 ⭐ Very Chill - Background music</option>
                    <option value={2}>2 ⭐⭐ Chill - Relaxed listening</option>
                    <option value={3}>3 ⭐⭐⭐ Medium - Moderate energy</option>
                    <option value={4}>4 ⭐⭐⭐⭐ Energetic - Active engagement</option>
                    <option value={5}>5 ⭐⭐⭐⭐⭐ High Energy - Intense moments</option>
                  </select>
                </div>

                {/* BPM and Key */}
                <div>
                  <label htmlFor="track-bpm" className="block text-sm font-medium text-gray-300 mb-2">
                    BPM
                    <span className="text-xs text-gray-500 ml-2">(60-200, optional)</span>
                  </label>
                  <input
                    id="track-bpm"
                    type="number"
                    value={trackMetadata.bpm || ''}
                    onChange={(e) => handleMetadataChange('bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                    className={`w-full bg-stream-gray border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none transition-colors ${
                      validationErrors.bpm 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-stream-light/20 focus:border-stream-accent'
                    }`}
                    placeholder="e.g., 120"
                    min="60"
                    max="200"
                  />
                  {validationErrors.bpm && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center"
                    >
                      <span className="mr-1">⚠️</span>
                      {validationErrors.bpm}
                    </motion.p>
                  )}
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
                <label htmlFor="track-tags" className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                  <span className="text-xs text-gray-500 ml-2" title="Keywords to help find this track">ℹ️</span>
                </label>
                <input
                  id="track-tags"
                  type="text"
                  value={trackMetadata.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                  placeholder="epic, orchestral, battle, intense (comma separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate tags with commas • Max 10 tags • Helps with search and discovery
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="track-description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                  <span className="text-xs text-gray-500 ml-2" title="Detailed information about the track">ℹ️</span>
                </label>
                <textarea
                  id="track-description"
                  value={trackMetadata.description || ''}
                  onChange={(e) => handleMetadataChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none resize-none"
                  placeholder="Describe the track's style, mood, and intended use..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 500 characters • Describe style, mood, and best use cases
                </p>
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

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-xl shadow-lg border border-green-500/30 max-w-sm z-50"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-2xl"
                >
                  ✅
                </motion.div>
                <div>
                  <h4 className="font-semibold">Track Uploaded Successfully!</h4>
                  <p className="text-sm text-green-100">
                    "{trackMetadata.title}" has been added to your library.
                  </p>
                  <button
                    onClick={() => {
                      // This would typically navigate to the library
                      // For now, we'll just close the toast
                      setShowSuccessToast(false);
                    }}
                    className="text-green-200 hover:text-white text-sm underline mt-1"
                  >
                    View in Library →
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
