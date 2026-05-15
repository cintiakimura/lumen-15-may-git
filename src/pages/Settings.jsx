import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft,
  Upload,
  Palette,
  Type,
  Save,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';
import { lumen } from '@/api/lumenClient';

const COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' }
];

const FONTS = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Roboto', value: 'Roboto' }
];

export default function Settings() {
  const navigate = useNavigate();
  const [branding, setBranding] = useState(storageService.getBranding());
  const [logoPreview, setLogoPreview] = useState(branding.logo);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const user = authService.getCurrentUser();

  useEffect(() => {
    lumen.auth.isAuthenticated().then(isAuth => {
      if (!isAuth) {
        lumen.auth.redirectToLogin();
      }
    });
  }, [navigate]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
        setBranding(prev => ({ ...prev, logo: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    storageService.setBranding(branding);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const goBack = () => {
    if (user?.role === 'teacher') {
      navigate(createPageUrl('TeacherDashboard'));
    } else {
      navigate(createPageUrl('Profile'));
    }
  };

  return (
    <div className="min-h-screen bg-[#212121]">
      <header className="sticky top-0 z-30 glass-card border-b border-[#333333] px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="text-[#e0e0e0] hover:bg-[#333333]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#e0e0e0]">Settings</h1>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Theme Card */}
        <Card style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-[#00c600] bg-[#00c600]/20' 
                    : 'border-[var(--glass-border)] hover:border-[#00c600]'
                }`}
              >
                <div className="text-4xl mb-2">🌙</div>
                <p className="font-medium" style={{ color: 'var(--text)' }}>Dark</p>
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-[#00c600] bg-[#00c600]/20' 
                    : 'border-[var(--glass-border)] hover:border-[#00c600]'
                }`}
              >
                <div className="text-4xl mb-2">☀️</div>
                <p className="font-medium" style={{ color: 'var(--text)' }}>Light</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Branding Card */}
        <Card style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-[#e0e0e0] mb-3">
                <Upload className="w-4 h-4 inline mr-2" />
                Logo
              </label>
              <div 
                onClick={() => document.getElementById('logoInput').click()}
                className="border-2 border-dashed border-[#333333] rounded-2xl p-6 text-center cursor-pointer hover:border-[#00c600] transition-colors"
              >
                <input
                  id="logoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo" 
                    className="w-20 h-20 object-contain mx-auto rounded-xl"
                  />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#a0a0a0] mx-auto mb-2" />
                    <p className="text-sm text-[#a0a0a0]">Click to upload</p>
                  </>
                )}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-[#e0e0e0] mb-3">
                <Palette className="w-4 h-4 inline mr-2" />
                Primary Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBranding(prev => ({ ...prev, primaryColor: color.value }))}
                    className={`w-12 h-12 rounded-xl transition-all ${
                      branding.primaryColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-slate-400' 
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <label className="block text-sm font-medium text-[#e0e0e0] mb-3">
                <Type className="w-4 h-4 inline mr-2" />
                Font Family
              </label>
              <div className="grid grid-cols-3 gap-3">
                {FONTS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setBranding(prev => ({ ...prev, font: font.value }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      branding.font === font.value 
                        ? 'border-[#00c600] bg-[#00c600]/20' 
                        : 'border-[#333333] hover:border-[#00c600]'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    <span className="text-lg font-medium text-[#e0e0e0]">Aa</span>
                    <p className="text-xs text-[#a0a0a0] mt-1">{font.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="glass-card border border-[#333333]">
          <CardHeader>
            <CardTitle className="text-[#e0e0e0]">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: branding.primaryColor, fontFamily: branding.font }}
            >
              <div className="flex items-center gap-3 mb-4">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
                )}
                <span className="text-white font-bold text-lg">Lumen Academy</span>
              </div>
              <p className="text-white/80">This is how your app will look with the selected branding.</p>
              <Button className="mt-4 bg-white text-slate-800 hover:bg-white/90">
                Sample Button
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full py-6 bg-[#00c600] hover:bg-[#00e600] text-[#212121] font-semibold"
        >
          {saved ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}