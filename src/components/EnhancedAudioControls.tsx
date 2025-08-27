import React, { useState, useEffect } from 'react';
// motion is not used here currently
import { audioController, AudioSettings } from '../services/audioController';
import HotkeyConfiguration from './HotkeyConfiguration';

interface EnhancedAudioControlsProps {
  className?: string;
}

const EnhancedAudioControls: React.FC<EnhancedAudioControlsProps> = ({ className = '' }) => {
  const [settings, setSettings] = useState<AudioSettings>(audioController.getSettings());
  const [volume, setVolume] = useState(audioController.getVolume());
  const [isPlaying, setIsPlaying] = useState(audioController.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioController.getCurrentTrack());

  useEffect(() => {
    // Listen to audio controller events
    const handleTrackStarted = (track: any) => setCurrentTrack(track);
    const handlePaused = () => setIsPlaying(false);
    const handleResumed = () => setIsPlaying(true);
    const handleStopped = () => setIsPlaying(false);
    const handleVolumeChanged = (vol: number) => setVolume(vol);

    audioController.on('trackStarted', handleTrackStarted);
    audioController.on('paused', handlePaused);
    audioController.on('resumed', handleResumed);
    audioController.on('stopped', handleStopped);
    audioController.on('volumeChanged', handleVolumeChanged);

    return () => {
      audioController.off('trackStarted', handleTrackStarted);
      audioController.off('paused', handlePaused);
      audioController.off('resumed', handleResumed);
      audioController.off('stopped', handleStopped);
      audioController.off('volumeChanged', handleVolumeChanged);
    };
  }, []);

  const updateSetting = (key: keyof AudioSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Apply to audio controller
    switch (key) {
      case 'volume':
        audioController.setVolume(value);
        break;
      case 'duckingEnabled':
        audioController.enableDucking(value);
        break;
      case 'duckingThreshold':
        audioController.setDuckingThreshold(value);
        break;
      case 'duckingAmount':
        audioController.setDuckingAmount(value);
        break;
      case 'normalizationEnabled':
        audioController.enableNormalization(value);
        break;
      case 'loopEnabled':
        audioController.setLooping(value, settings.loopCount);
        break;
      case 'loopCount':
        audioController.setLooping(settings.loopEnabled, value);
        break;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioController.setVolume(newVolume);
  };

  const handleFadeIn = () => {
    audioController.fadeIn(settings.fadeInDuration);
  };

  const handleFadeOut = () => {
    audioController.fadeOut(settings.fadeOutDuration);
  };

  return (
    <div className={`bg-gray-800 p-6 rounded-lg border border-gray-700 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6">Professional Audio Controls</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume and Basic Controls */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Volume & Playback</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Master Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fade In Duration (s)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={settings.fadeInDuration}
                onChange={(e) => updateSetting('fadeInDuration', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fade Out Duration (s)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={settings.fadeOutDuration}
                onChange={(e) => updateSetting('fadeOutDuration', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleFadeIn}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Fade In
            </button>
            <button
              onClick={handleFadeOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Fade Out
            </button>
          </div>
        </div>

        {/* Audio Ducking Controls */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Audio Ducking</h4>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ducking"
              checked={settings.duckingEnabled}
              onChange={(e) => updateSetting('duckingEnabled', e.target.checked)}
              className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="ducking" className="text-sm font-medium text-gray-300">
              Enable Audio Ducking
            </label>
          </div>

          {settings.duckingEnabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ducking Threshold: {settings.duckingThreshold} dB
                </label>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  step="1"
                  value={settings.duckingThreshold}
                  onChange={(e) => updateSetting('duckingThreshold', Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ducking Amount: {Math.round(settings.duckingAmount * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.duckingAmount}
                  onChange={(e) => updateSetting('duckingAmount', Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Crossfading and Looping */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Crossfading & Looping</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Crossfade Duration: {settings.crossfadeDuration}s
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={settings.crossfadeDuration}
              onChange={(e) => updateSetting('crossfadeDuration', Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="looping"
                checked={settings.loopEnabled}
                onChange={(e) => updateSetting('loopEnabled', e.target.checked)}
                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="looping" className="text-sm font-medium text-gray-300">
                Enable Looping
              </label>
            </div>

            {settings.loopEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Loop Count: {settings.loopCount === -1 ? 'Infinite' : settings.loopCount}
                </label>
                <input
                  type="number"
                  min="-1"
                  max="100"
                  step="1"
                  value={settings.loopCount === -1 ? '' : settings.loopCount}
                  onChange={(e) => updateSetting('loopCount', e.target.value === '' ? -1 : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="-1 for infinite"
                />
              </div>
            )}
          </div>
        </div>

        {/* Audio Normalization */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Audio Processing</h4>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="normalization"
              checked={settings.normalizationEnabled}
              onChange={(e) => updateSetting('normalizationEnabled', e.target.checked)}
              className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="normalization" className="text-sm font-medium text-gray-300">
              Enable Audio Normalization
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hotkeys"
              checked={audioController.getSettings().duckingEnabled}
              onChange={() => audioController.enableHotkeys(!audioController.getSettings().duckingEnabled)}
              className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hotkeys" className="text-sm font-medium text-gray-300">
              Enable Hotkeys
            </label>
          </div>
        </div>
      </div>

      {/* Current Track Info */}
      {currentTrack && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-lg font-medium text-white mb-2">Now Playing</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{currentTrack.title}</p>
              <p className="text-gray-400 text-sm">
                {currentTrack.mood} • {currentTrack.genre} • {currentTrack.duration}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isPlaying ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-300'
              }`}>
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
              {settings.loopEnabled && (
                <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs font-medium">
                  Loop {settings.loopCount === -1 ? '∞' : settings.loopCount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hotkey Configuration */}
      <div className="mt-6">
        <HotkeyConfiguration />
      </div>
    </div>
  );
};

export default EnhancedAudioControls;
