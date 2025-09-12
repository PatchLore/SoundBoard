import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '../../types/track';
import { STREAMING_CATEGORIES } from '../../data/categories';
import trackManagementService from '../../services/trackManagementService';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../Toast';

interface EnhancedTrackUploaderProps {
  onTrackUpload: (track: Track) => void;
  onClose: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

const EnhancedTrackUploader: React.FC<EnhancedTrackUploaderProps> = ({ onTrackUpload, onClose }) => {
  const { user, isAgency } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [uploadedTrackId, setUploadedTrackId] = useState<string | null>(null);
  const [ariaLiveMessage, setAriaLiveMessage] = useState('');

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
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Hide UI unless user is authenticated and has agency role
  if (!user || !isAgency) {
    return null;
  }

  const validateFile = (file: File): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Check file type
    if (!file.type.includes('audio/')) {
      errors.push({
        field: 'file',
        message: 'Please select an audio file (MP3, WAV, OGG, M4A)'
      });
    }
    
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: `File size must be under 50MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      });
    }
    
    // Check file name
    if (file.name.length > 100) {
      errors.push({
        field: 'file',
        message: 'File name must be under 100 characters'
      });
    }
    
    return errors;
  };

  const validateMetadata = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!trackMetadata.title?.trim()) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (trackMetadata.title.length > 100) {
      errors.push({ field: 'title', message: 'Title must be under 100 characters' });
    }
    
    if (!trackMetadata.artist?.trim()) {
      errors.push({ field: 'artist', message: 'Artist is required' });
    } else if (trackMetadata.artist.length > 100) {
      errors.push({ field: 'artist', message: 'Artist name must be under 100 characters' });
    }
    
    if (trackMetadata.bpm && (trackMetadata.bpm < 60 || trackMetadata.bpm > 200)) {
      errors.push({ field: 'bpm', message: 'BPM must be between 60 and 200' });
    }
    
    if (trackMetadata.tags && trackMetadata.tags.length > 10) {
      errors.push({ field: 'tags', message: 'Maximum 10 tags allowed' });
    }
    
    return errors;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setAriaLiveMessage('Drag over detected. Drop your audio file to upload.');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
      setAriaLiveMessage('Drag cancelled.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
    setAriaLiveMessage('File dropped. Processing...');
  }, []);

  const handleFileSelect = (file: File) => {
    setValidationErrors([]);
    setAriaLiveMessage('File selected. Validating...');
    
    const fileErrors = validateFile(file);
    if (fileErrors.length > 0) {
      setValidationErrors(fileErrors);
      setToastMessage(fileErrors[0].message);
      setToastType('error');
      setShowToast(true);
      setAriaLiveMessage(`File validation failed: ${fileErrors[0].message}`);
      return;
    }

    setUploadedFile(file);
    setTrackMetadata(prev => ({
      ...prev,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      artist: 'Unknown Artist'
    }));
    setShowMetadataForm(true);
    setAriaLiveMessage(`File "${file.name}" selected successfully. Please fill in track information.`);
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
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => error.field !== field));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setTrackMetadata(prev => ({ ...prev, tags }));
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    // Validate metadata
    const metadataErrors = validateMetadata();
    if (metadataErrors.length > 0) {
      setValidationErrors(metadataErrors);
      setToastMessage(metadataErrors[0].message);
      setToastType('error');
      setShowToast(true);
      setAriaLiveMessage(`Validation failed: ${metadataErrors[0].message}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setAriaLiveMessage('Starting upload process...');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('metadata', JSON.stringify(trackMetadata));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Upload to backend API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      clearInterval(progressInterval);

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
      setAriaLiveMessage('Upload completed successfully!');

      // Show success toast
      setUploadedTrackId(newTrack.id);
      setToastMessage('Track uploaded successfully!');
      setToastType('success');
      setShowToast(true);

      // Wait a bit to show completion
      setTimeout(() => {
        onTrackUpload(newTrack);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setToastMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setToastType('error');
      setShowToast(true);
      setAriaLiveMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setUploadedFile(null);
    setShowMetadataForm(false);
    setValidationErrors([]);
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
    setAriaLiveMessage('Form reset.');
  };

  const handleViewInLibrary = () => {
    if (uploadedTrackId) {
      // Scroll to the uploaded track in the library
      const trackElement = document.querySelector(`[data-track-id="${uploadedTrackId}"]`);
      if (trackElement) {
        trackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    setShowToast(false);
  };

  return (
    <>
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
              aria-label="Close uploader"
            >
              ✕
            </button>
          </div>

          {/* File Upload Area */}
          {!showMetadataForm && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Drag and Drop Zone */}
              <div
                ref={dropZoneRef}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                  ${isDragging 
                    ? 'border-stream-accent bg-stream-accent/20 scale-105 shadow-lg shadow-stream-accent/20' 
                    : 'border-stream-light/30 hover:border-stream-light/50'
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-describedby="drop-zone-description"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDragging ? '📁' : '🎵'}
                </motion.div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragging ? 'Drop your audio file here' : 'Upload Audio Track'}
                </h3>
                
                <p className="text-gray-400 mb-6" id="drop-zone-description">
                  Drag and drop your audio file here, or click to browse
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
                  aria-label="Select audio file"
                />
              </div>

              {/* File Requirements */}
              <div className="bg-stream-gray/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">File Requirements</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Supported formats: MP3, WAV, OGG, M4A</li>
                  <li>• Maximum file size: 50MB</li>
                  <li>• File name must be under 100 characters</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <motion.div
              className="mb-4 p-4 bg-red-600/20 border border-red-600/30 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-sm font-medium text-red-400 mb-2">Please fix the following errors:</h4>
              <ul className="text-sm text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </motion.div>
          )}

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
                    </label>
                    <input
                      id="track-title"
                      type="text"
                      value={trackMetadata.title}
                      onChange={(e) => handleMetadataChange('title', e.target.value)}
                      className={`w-full bg-stream-gray border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                        validationErrors.some(e => e.field === 'title') 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-stream-light/20 focus:border-stream-accent'
                      }`}
                      placeholder="e.g., Epic Battle Theme"
                      aria-describedby="title-hint"
                    />
                    <p id="title-hint" className="text-xs text-gray-500 mt-1">
                      Enter a descriptive title for your track
                    </p>
                  </div>

                  <div>
                    <label htmlFor="track-artist" className="block text-sm font-medium text-gray-300 mb-2">
                      Artist *
                    </label>
                    <input
                      id="track-artist"
                      type="text"
                      value={trackMetadata.artist}
                      onChange={(e) => handleMetadataChange('artist', e.target.value)}
                      className={`w-full bg-stream-gray border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                        validationErrors.some(e => e.field === 'artist') 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-stream-light/20 focus:border-stream-accent'
                      }`}
                      placeholder="e.g., Your Artist Name"
                      aria-describedby="artist-hint"
                    />
                    <p id="artist-hint" className="text-xs text-gray-500 mt-1">
                      Your name or artist name
                    </p>
                  </div>

                  {/* Category and Subcategory */}
                  <div>
                    <label htmlFor="track-category" className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
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
                    </label>
                    <input
                      id="track-subcategory"
                      type="text"
                      value={trackMetadata.subcategory}
                      onChange={(e) => handleMetadataChange('subcategory', e.target.value)}
                      className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                      placeholder="e.g., orchestral, electronic, acoustic"
                      aria-describedby="subcategory-hint"
                    />
                    <p id="subcategory-hint" className="text-xs text-gray-500 mt-1">
                      More specific genre or style
                    </p>
                  </div>

                  {/* Mood and Energy */}
                  <div>
                    <label htmlFor="track-mood" className="block text-sm font-medium text-gray-300 mb-2">
                      Mood *
                    </label>
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
                    <label htmlFor="track-energy" className="block text-sm font-medium text-gray-300 mb-2">
                      Energy Level *
                    </label>
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
                    <label htmlFor="track-bpm" className="block text-sm font-medium text-gray-300 mb-2">
                      BPM
                    </label>
                    <input
                      id="track-bpm"
                      type="number"
                      value={trackMetadata.bpm || ''}
                      onChange={(e) => handleMetadataChange('bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                      className={`w-full bg-stream-gray border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                        validationErrors.some(e => e.field === 'bpm') 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-stream-light/20 focus:border-stream-accent'
                      }`}
                      placeholder="e.g., 120"
                      min="60"
                      max="200"
                      aria-describedby="bpm-hint"
                    />
                    <p id="bpm-hint" className="text-xs text-gray-500 mt-1">
                      Beats per minute (60-200)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="track-key" className="block text-sm font-medium text-gray-300 mb-2">
                      Musical Key
                    </label>
                    <input
                      id="track-key"
                      type="text"
                      value={trackMetadata.key}
                      onChange={(e) => handleMetadataChange('key', e.target.value)}
                      className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none"
                      placeholder="e.g., C major, A minor"
                      aria-describedby="key-hint"
                    />
                    <p id="key-hint" className="text-xs text-gray-500 mt-1">
                      Musical key or scale
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label htmlFor="track-tags" className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    id="track-tags"
                    type="text"
                    value={trackMetadata.tags?.join(', ') || ''}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className={`w-full bg-stream-gray border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                      validationErrors.some(e => e.field === 'tags') 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-stream-light/20 focus:border-stream-accent'
                    }`}
                    placeholder="epic, orchestral, battle, intense (comma separated)"
                    aria-describedby="tags-hint"
                  />
                  <p id="tags-hint" className="text-xs text-gray-500 mt-1">
                    Separate tags with commas. Maximum 10 tags.
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label htmlFor="track-description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="track-description"
                    value={trackMetadata.description || ''}
                    onChange={(e) => handleMetadataChange('description', e.target.value)}
                    rows={3}
                    className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-stream-accent focus:outline-none resize-none"
                    placeholder="Describe the track's style, mood, and intended use..."
                    aria-describedby="description-hint"
                  />
                  <p id="description-hint" className="text-xs text-gray-500 mt-1">
                    Optional description for better organization
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
                      <span className="text-sm text-gray-300">{Math.round(uploadProgress)}%</span>
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

      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
            action={toastType === 'success' && uploadedTrackId ? {
              label: 'View in Library',
              onClick: handleViewInLibrary
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* ARIA Live Region for Screen Readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaLiveMessage}
      </div>
    </>
  );
};

export default EnhancedTrackUploader;
