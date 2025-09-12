import React, { useState, useEffect } from 'react';
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

  const [logoUploading, setLogoUploading] = useState(false);

  // Simplified branding - only logo is used
  const applyBrandingToCSS = (brandingData: AgencyBranding) => {
    console.log('Logo updated:', brandingData.logo);
  };

  // Load branding from localStorage on mount
  useEffect(() => {
    const savedBranding = localStorage.getItem('agency-branding');
    if (savedBranding) {
      try {
        const parsed = JSON.parse(savedBranding);
        setBranding(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to load saved branding:', error);
      }
    }
  }, []);

  // Apply branding when component mounts or branding changes
  useEffect(() => {
    applyBrandingToCSS(branding);
  }, [branding]);

  const handleColorChange = (field: keyof AgencyBranding, value: string) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Apply branding immediately
    applyBrandingToCSS(branding);
    
    // Save to localStorage for persistence
    localStorage.setItem('agency-branding', JSON.stringify(branding));
    
    // Call parent save function
    onSave(branding);
    
    // Show success feedback
    const saveButton = document.querySelector('button[onclick="handleSave()"]');
    if (saveButton) {
      const originalText = saveButton.textContent;
      const originalClass = saveButton.className;
      saveButton.textContent = 'Saved!';
      saveButton.className = 'px-4 py-2 bg-green-700 text-white rounded-lg transition-colors';
      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.className = originalClass;
      }, 2000);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Branding & Customization</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-2xl">
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
                  {branding.logo ? (
                    <img 
                      src={branding.logo} 
                      alt="Agency Logo" 
                      className="h-16 w-16 rounded border border-gray-600 object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded border border-gray-600 bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                      VS
                    </div>
                  )}
                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      disabled={logoUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Check file size (2MB limit)
                          if (file.size > 2 * 1024 * 1024) {
                            alert('File size must be less than 2MB');
                            return;
                          }
                          
                          // Check file type
                          if (!file.type.startsWith('image/')) {
                            alert('Please select an image file (JPG, PNG, GIF)');
                            return;
                          }
                          
                          setLogoUploading(true);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setBranding(prev => ({ ...prev, logo: result }));
                            setLogoUploading(false);
                            // Show success feedback
                            const label = document.querySelector('label[for="logo-upload"]');
                            if (label) {
                              const originalText = label.textContent;
                              label.textContent = 'Logo Uploaded!';
                              label.className = 'px-4 py-2 bg-green-600 text-white rounded-lg transition-colors cursor-pointer text-center';
                              setTimeout(() => {
                                label.textContent = 'Upload New Logo';
                                label.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer text-center';
                              }, 2000);
                            }
                          };
                          reader.onerror = () => {
                            alert('Failed to read file. Please try again.');
                            setLogoUploading(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className={`px-4 py-2 rounded-lg transition-colors cursor-pointer text-center ${
                        logoUploading 
                          ? 'bg-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {logoUploading ? 'Uploading...' : 'Upload New Logo'}
                    </label>
                    {branding.logo && (
                      <button 
                        onClick={() => setBranding(prev => ({ ...prev, logo: '' }))}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, GIF. Max size: 2MB</p>
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






        </div>


      </div>
    </div>
  );
};

export default BrandingCustomization;
