import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioController, HotkeyConfig } from '../services/audioController';

const HotkeyConfiguration: React.FC = () => {
  const [hotkeys, setHotkeys] = useState<Map<string, HotkeyConfig>>(audioController.getHotkeys());
  const [showEditor, setShowEditor] = useState(false);
  const [editingHotkey, setEditingHotkey] = useState<Partial<HotkeyConfig>>({});

  useEffect(() => {
    // Refresh hotkeys when component mounts
    setHotkeys(new Map(audioController.getHotkeys()));
  }, []);

  const addHotkey = (config: HotkeyConfig) => {
    audioController.addHotkey(config);
    setHotkeys(new Map(audioController.getHotkeys()));
    setEditingHotkey({});
  };

  const removeHotkey = (key: string) => {
    audioController.removeHotkey(key);
    setHotkeys(new Map(audioController.getHotkeys()));
  };

  const handleSave = () => {
    if (editingHotkey.key && editingHotkey.action) {
      addHotkey(editingHotkey as HotkeyConfig);
    }
  };

  const getHotkeyString = (config: HotkeyConfig): string => {
    const modifiers = [];
    if (config.ctrl) modifiers.push('Ctrl');
    if (config.shift) modifiers.push('Shift');
    if (config.alt) modifiers.push('Alt');
    modifiers.push(config.key.toUpperCase());
    return modifiers.join('+');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-white">Hotkey Configuration</h4>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {showEditor ? 'Hide' : 'Add'} Hotkey
        </button>
      </div>

      {/* Current Hotkeys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {Array.from(hotkeys.entries()).map(([key, config]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <span className="text-white font-medium">{key}</span>
              <p className="text-gray-400 text-sm capitalize">{config.action}</p>
            </div>
            <button
              onClick={() => removeHotkey(key)}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Hotkey Editor */}
      {showEditor && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-gray-700 rounded-lg"
        >
          <h5 className="text-md font-medium text-white mb-3">Add New Hotkey</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Key</label>
              <input
                type="text"
                placeholder="Space, A, F1"
                value={editingHotkey.key || ''}
                onChange={(e) => setEditingHotkey(prev => ({ ...prev, key: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
              />
            </div>

            {/* Modifiers */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Modifiers</label>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingHotkey.ctrl || false}
                    onChange={(e) => setEditingHotkey(prev => ({ ...prev, ctrl: e.target.checked }))}
                    className="rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Ctrl</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingHotkey.shift || false}
                    onChange={(e) => setEditingHotkey(prev => ({ ...prev, shift: e.target.checked }))}
                    className="rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Shift</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingHotkey.alt || false}
                    onChange={(e) => setEditingHotkey(prev => ({ ...prev, alt: e.target.checked }))}
                    className="rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Alt</span>
                </label>
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Action</label>
              <select
                value={editingHotkey.action || ''}
                onChange={(e) => setEditingHotkey(prev => ({ ...prev, action: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
              >
                <option value="">Select Action</option>
                <option value="play">Play</option>
                <option value="pause">Pause</option>
                <option value="next">Next Track</option>
                <option value="previous">Previous Track</option>
                <option value="volume_up">Volume Up</option>
                <option value="volume_down">Volume Down</option>
                <option value="mute">Mute</option>
                <option value="duck">Toggle Ducking</option>
              </select>
            </div>

            {/* Add Button */}
            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={!editingHotkey.key || !editingHotkey.action}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Add Hotkey
              </button>
            </div>
          </div>

          {/* Preview */}
          {editingHotkey.key && editingHotkey.action && (
            <div className="mt-3 p-2 bg-gray-600 rounded text-center">
              <span className="text-gray-300 text-sm">
                Preview: <span className="text-white font-medium">
                  {getHotkeyString(editingHotkey as HotkeyConfig)}
                </span> → <span className="text-blue-400 capitalize">
                  {editingHotkey.action}
                </span>
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Hotkey Help */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <h6 className="text-sm font-medium text-white mb-2">Default Hotkeys</h6>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>Space → Play/Pause</div>
          <div>Arrow Keys → Volume</div>
          <div>M → Mute</div>
          <div>D → Toggle Ducking</div>
        </div>
      </div>
    </div>
  );
};

export default HotkeyConfiguration;







