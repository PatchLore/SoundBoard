import React, { useState } from 'react';
import { Streamer, BulkOperation } from '../types/agency';
import PlaceholderAvatar from './PlaceholderAvatar';

interface BulkOperationsProps {
  streamers: Streamer[];
  onExecute: (operation: BulkOperation) => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({ streamers, onExecute }) => {
  const [selectedStreamers, setSelectedStreamers] = useState<string[]>([]);
  const [operationType, setOperationType] = useState<BulkOperation['operationType']>('volume_change');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSelectAll = () => {
    if (selectedStreamers.length === streamers.length) {
      setSelectedStreamers([]);
    } else {
      setSelectedStreamers(streamers.map(s => s.id));
    }
  };

  const handleStreamerToggle = (streamerId: string) => {
    setSelectedStreamers(prev => 
      prev.includes(streamerId) 
        ? prev.filter(id => id !== streamerId)
        : [...prev, streamerId]
    );
  };

  const handleExecute = async () => {
    if (selectedStreamers.length === 0) return;

    setIsExecuting(true);
    
    const operation: BulkOperation = {
      id: `bulk_${Date.now()}`,
      agencyId: 'agency_001', // This would come from context
      operationType,
      targetStreamers: selectedStreamers,
      parameters,
      status: 'pending',
      createdAt: new Date()
    };

    try {
      await onExecute(operation);
      setSelectedStreamers([]);
      setParameters({});
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderOperationForm = () => {
    switch (operationType) {
      case 'volume_change':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Volume Level
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={parameters.volume || 50}
                onChange={(e) => setParameters({ ...parameters, volume: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>0%</span>
                <span>{parameters.volume || 50}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        );

      case 'track_add':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Track ID to Add
              </label>
              <input
                type="text"
                placeholder="e.g., yt_001"
                value={parameters.trackId || ''}
                onChange={(e) => setParameters({ ...parameters, trackId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add to Favorites
              </label>
              <input
                type="checkbox"
                checked={parameters.addToFavorites || false}
                onChange={(e) => setParameters({ ...parameters, addToFavorites: e.target.checked })}
                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'category_update':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Default Category
              </label>
              <select
                value={parameters.category || ''}
                onChange={(e) => setParameters({ ...parameters, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select category...</option>
                <option value="intro">Intro Music</option>
                <option value="background_chat">Background Chat</option>
                <option value="gaming_action">Gaming Action</option>
                <option value="boss_battle">Boss Battle</option>
                <option value="intermission">Intermission</option>
                <option value="outro">Outro Music</option>
              </select>
            </div>
          </div>
        );

      case 'theme_change':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Theme
              </label>
              <select
                value={parameters.theme || ''}
                onChange={(e) => setParameters({ ...parameters, theme: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select theme...</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Bulk Operations</h3>
        
        {/* Streamer Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Select Streamers</h4>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {selectedStreamers.length === streamers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
            {streamers.map((streamer) => (
              <label key={streamer.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
                <input
                  type="checkbox"
                  checked={selectedStreamers.includes(streamer.id)}
                  onChange={() => handleStreamerToggle(streamer.id)}
                  className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <PlaceholderAvatar name={streamer.name} size="sm" />
                  <span className="text-white text-sm">{streamer.name}</span>
                </div>
              </label>
            ))}
          </div>
          
          <p className="text-sm text-gray-400 mt-2">
            {selectedStreamers.length} streamer{selectedStreamers.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Operation Configuration */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-4">Operation Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Operation Type
              </label>
              <select
                value={operationType}
                onChange={(e) => {
                  setOperationType(e.target.value as BulkOperation['operationType']);
                  setParameters({});
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="volume_change">Volume Change</option>
                <option value="track_add">Add Track</option>
                <option value="category_update">Update Category</option>
                <option value="theme_change">Change Theme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Affected Streamers
              </label>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-white font-medium">{selectedStreamers.length}</p>
                <p className="text-gray-400 text-sm">
                  {selectedStreamers.length > 0 
                    ? streamers.filter(s => selectedStreamers.includes(s.id)).map(s => s.name).join(', ')
                    : 'No streamers selected'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Operation Form */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h5 className="text-md font-medium text-white mb-3">Operation Parameters</h5>
            {renderOperationForm()}
          </div>
        </div>

        {/* Execute Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExecute}
            disabled={selectedStreamers.length === 0 || isExecuting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedStreamers.length === 0 || isExecuting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isExecuting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Executing...</span>
              </div>
            ) : (
              `Execute on ${selectedStreamers.length} Streamer${selectedStreamers.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>

      {/* Recent Operations */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Operations</h3>
        <div className="text-gray-400 text-center py-8">
          <p>Operation history will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;
