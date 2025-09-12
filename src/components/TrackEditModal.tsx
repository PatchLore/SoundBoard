import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../types/track';
import { STREAMING_CATEGORIES } from '../data/categories';

interface TrackEditModalProps {
  track: Track;
  onClose: () => void;
  onSave: (updatedTrack: Track) => void;
}

const TrackEditModal: React.FC<TrackEditModalProps> = ({ track, onClose, onSave }) => {
  const [editedTrack, setEditedTrack] = useState<Track>({ ...track });
  const [isSaving, setIsSaving] = useState(false);

  // Available options for dropdowns
  const categories = STREAMING_CATEGORIES.map(cat => cat.id);
  const moods = ['chill', 'epic', 'energetic', 'mysterious', 'uplifting', 'dark', 'peaceful'];
  const energyLevels = [1, 2, 3, 4, 5];

  const handleInputChange = (field: keyof Track, value: any) => {
    setEditedTrack(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update the track with new data
      const updatedTrack = {
        ...editedTrack,
        // Ensure required fields are present
        category: editedTrack.category || 'chill-gaming',
        mood: editedTrack.mood || 'chill',
        energy: editedTrack.energy || 3,
        tags: editedTrack.tags || [],
        streamSafe: editedTrack.streamSafe ?? true,
        loopFriendly: editedTrack.loopFriendly ?? false,
        hasIntro: editedTrack.hasIntro ?? false,
        hasOutro: editedTrack.hasOutro ?? false,
        dmcaSafe: editedTrack.dmcaSafe ?? true,
        approved: editedTrack.approved ?? true,
        featured: editedTrack.featured ?? false
      };

      onSave(updatedTrack);
      onClose();
    } catch (error) {
      console.error('Failed to save track:', error);
      alert('Failed to save track. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...editedTrack.tags];
    newTags[index] = value;
    setEditedTrack(prev => ({ ...prev, tags: newTags }));
  };

  const addTag = () => {
    setEditedTrack(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    setEditedTrack(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
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
          <h2 className="text-2xl font-bold text-white">✏️ Edit Track</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Track Info */}
        <div className="mb-6 p-4 bg-stream-gray rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">{track.title}</h3>
          <p className="text-gray-400">by {track.artist}</p>
          <p className="text-gray-400 text-sm">Duration: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={editedTrack.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
              <input
                type="text"
                value={editedTrack.artist}
                onChange={(e) => handleInputChange('artist', e.target.value)}
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Category and Mood */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
              <select
                value={editedTrack.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
              <select
                value={editedTrack.mood}
                onChange={(e) => handleInputChange('mood', e.target.value)}
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
              >
                {moods.map(mood => (
                  <option key={mood} value={mood}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Energy and BPM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Energy Level</label>
              <select
                value={editedTrack.energy}
                onChange={(e) => handleInputChange('energy', parseInt(e.target.value))}
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
              >
                {energyLevels.map(level => (
                  <option key={level} value={level}>
                    {level} - {level === 1 ? 'Very Chill' : level === 5 ? 'High Energy' : `${level}/5`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">BPM (optional)</label>
              <input
                type="number"
                value={editedTrack.bpm || ''}
                onChange={(e) => handleInputChange('bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 120"
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Key and Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Musical Key (optional)</label>
              <input
                type="text"
                value={editedTrack.key || ''}
                onChange={(e) => handleInputChange('key', e.target.value)}
                placeholder="e.g., C major, D minor"
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
              <input
                type="text"
                value={editedTrack.subcategory || ''}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="e.g., boss-battle, intro"
                className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={editedTrack.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="Describe the track's style, use case, or mood..."
              className="w-full bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="space-y-2">
              {editedTrack.tags.map((tag, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder="Enter tag"
                    className="flex-1 bg-stream-gray border border-stream-light/20 rounded-lg px-3 py-2 text-white focus:border-stream-accent focus:outline-none"
                  />
                  <button
                    onClick={() => removeTag(index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={addTag}
                className="px-4 py-2 bg-stream-accent hover:bg-stream-accent/90 text-white rounded-lg transition-colors"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* Safety Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="streamSafe"
                checked={editedTrack.streamSafe}
                onChange={(e) => handleInputChange('streamSafe', e.target.checked)}
                className="w-4 h-4 text-stream-accent bg-stream-gray border-stream-light/20 rounded focus:ring-stream-accent"
              />
              <label htmlFor="streamSafe" className="text-sm text-gray-300">Stream Safe</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="dmcaSafe"
                checked={editedTrack.dmcaSafe}
                onChange={(e) => handleInputChange('dmcaSafe', e.target.checked)}
                className="w-4 h-4 text-stream-accent bg-stream-gray border-stream-light/20 rounded focus:ring-stream-accent"
              />
              <label htmlFor="dmcaSafe" className="text-sm text-gray-300">DMCA Safe</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="loopFriendly"
                checked={editedTrack.loopFriendly}
                onChange={(e) => handleInputChange('loopFriendly', e.target.checked)}
                className="w-4 h-4 text-stream-accent bg-stream-gray border-stream-light/20 rounded focus:ring-stream-accent"
              />
              <label htmlFor="loopFriendly" className="text-sm text-gray-300">Loop Friendly</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured"
                checked={editedTrack.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="w-4 h-4 text-stream-accent bg-stream-gray border-stream-light/20 rounded focus:ring-stream-accent"
              />
              <label htmlFor="featured" className="text-sm text-gray-300">Featured Track</label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-stream-accent hover:bg-stream-accent/90 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrackEditModal;

