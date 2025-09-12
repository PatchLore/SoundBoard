import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../types/track';

interface BulkUploadModalProps {
  onClose: () => void;
  onUploadComplete: (tracks: Track[]) => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(file => file.type.includes('audio/'));
    setUploadedFiles(prev => [...prev, ...audioFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter(file => file.type.includes('audio/'));
    setUploadedFiles(prev => [...prev, ...audioFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate bulk upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create sample tracks from files
      const newTracks: Track[] = uploadedFiles.map((file, index) => ({
        id: `bulk_${Date.now()}_${index}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Bulk Upload',
        duration: 0,
        audioUrl: URL.createObjectURL(file),
        category: 'gaming-action',
        subcategory: 'bulk-upload',
        mood: 'energetic',
        energy: 4,
        bpm: undefined,
        key: '',
        tags: ['bulk-upload'],
        description: `Bulk uploaded track: ${file.name}`,
        streamSafe: true,
        loopFriendly: false,
        hasIntro: false,
        hasOutro: false,
        dmcaSafe: true,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'bulk-upload',
        approved: true,
        featured: false,
        usageTracking: {
          usageCount: 0,
          lastUsed: undefined
        }
      }));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Wait a bit to show completion
      setTimeout(() => {
        onUploadComplete(newTracks);
      }, 500);

    } catch (error) {
      console.error('Bulk upload failed:', error);
      alert('Bulk upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
          <h2 className="text-2xl font-bold text-white">📁 Bulk Upload Tracks</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-stream-accent bg-stream-accent/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop audio files'}
          </h3>
          <p className="text-gray-400 mb-4">
            or click to browse files
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
          >
            Choose Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Files to Upload ({uploadedFiles.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-stream-gray rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-stream-accent">🎵</span>
                    <span className="text-white">{file.name}</span>
                    <span className="text-gray-400 text-sm">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Uploading...</span>
              <span className="text-gray-400">{uploadProgress}%</span>
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
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0 || isUploading}
            className="flex-1 px-4 py-3 bg-stream-accent hover:bg-stream-accent/90 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} Files`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BulkUploadModal;
