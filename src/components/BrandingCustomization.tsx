import React, { useState } from 'react';
import { Agency, AgencyBranding } from '../types/agency';

interface BrandingCustomizationProps {
  agency: Agency;
  onSave: (branding: AgencyBranding) => void;
}

const BrandingCustomization: React.FC<BrandingCustomizationProps> = ({ agency, onSave }) => {
  const [branding, setBranding] = useState<AgencyBranding>({
    agencyId: agency.id,
    logo: agency.logo,
    primaryColor: agency.primaryColor,
    secondaryColor: agency.secondaryColor,
    accentColor: agency.accentColor,
    customCSS: '',
    fontFamily: 'Inter',
    borderRadius: 'rounded-lg',
    shadowStyle: 'shadow-lg'
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (field: keyof AgencyBranding, value: string) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(branding);
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Modern)' },
    { value: 'Roboto', label: 'Roboto (Clean)' },
    { value: 'Open Sans', label: 'Open Sans (Friendly)' },
    { value: 'Poppins', label: 'Poppins (Bold)' },
    { value: 'Montserrat', label: 'Montserrat (Elegant)' }
  ];

  const borderRadiusOptions = [
    { value: 'rounded-none', label: 'Sharp' },
    { value: 'rounded', label: 'Slight' },
    { value: 'rounded-lg', label: 'Medium' },
    { value: 'rounded-xl', label: 'Large' },
    { value: 'rounded-2xl', label: 'Extra Large' }
  ];

  const shadowOptions = [
    { value: 'shadow-sm', label: 'Subtle' },
    { value: 'shadow', label: 'Normal' },
    { value: 'shadow-lg', label: 'Prominent' },
    { value: 'shadow-xl', label: 'Strong' },
    { value: 'shadow-2xl', label: 'Bold' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Branding & Customization</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              previewMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:text-white'
            }`}
          >
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branding Controls */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Logo & Identity</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agency Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded border border-gray-600 bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                    VS
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Upload New Logo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agency Name
                </label>
                <input
                  type="text"
                  value={agency.name}
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Contact support to change agency name</p>
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Color Scheme</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="#1f2937"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="#374151"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Spacing */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Typography & Spacing</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Family
                </label>
                <select
                  value={branding.fontFamily}
                  onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {fontOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Border Radius
                </label>
                <select
                  value={branding.borderRadius}
                  onChange={(e) => handleColorChange('borderRadius', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {borderRadiusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Shadow Style
                </label>
                <select
                  value={branding.shadowStyle}
                  onChange={(e) => handleColorChange('shadowStyle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {shadowOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Custom CSS</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional CSS Rules
              </label>
              <textarea
                value={branding.customCSS}
                onChange={(e) => handleColorChange('customCSS', e.target.value)}
                placeholder="/* Add your custom CSS here */"
                rows={6}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Advanced users can add custom CSS rules for further customization
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Live Preview</h3>
            
            {previewMode ? (
              <div 
                className="p-6 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: branding.primaryColor,
                  borderRadius: branding.borderRadius === 'rounded-none' ? '0' : 
                              branding.borderRadius === 'rounded' ? '4px' :
                              branding.borderRadius === 'rounded-lg' ? '8px' :
                              branding.borderRadius === 'rounded-xl' ? '12px' : '16px',
                  boxShadow: branding.shadowStyle === 'shadow-sm' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' :
                             branding.shadowStyle === 'shadow' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' :
                             branding.shadowStyle === 'shadow-lg' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' :
                             branding.shadowStyle === 'shadow-xl' ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' :
                             '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto mb-4 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    VS
                  </div>
                  <h4 className="text-xl font-bold mb-2" style={{ color: branding.accentColor }}>
                    {agency.name}
                  </h4>
                  <p className="text-sm" style={{ color: branding.secondaryColor }}>
                    Professional Streaming Solutions
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div 
                      className="p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: branding.secondaryColor }}
                    >
                      <span className="text-sm" style={{ color: branding.primaryColor }}>
                        Sample Button
                      </span>
                    </div>
                    
                    <div 
                      className="p-3 rounded-lg border-2 border-dashed transition-colors"
                      style={{ borderColor: branding.accentColor }}
                    >
                      <span className="text-sm" style={{ color: branding.accentColor }}>
                        Sample Card
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Click "Show Preview" to see your branding in action</p>
              </div>
            )}
          </div>

          {/* Branding Guidelines */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Branding Guidelines</h3>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Primary colors should provide good contrast for text</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Secondary colors work best for backgrounds and borders</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Accent colors should be used sparingly for highlights</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Ensure all color combinations meet accessibility standards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingCustomization;
