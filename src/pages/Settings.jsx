import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft,
  Upload,
  Palette,
  Type,
  Save,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
} from '@/lib/appRuntime';

const COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
];

const FONTS = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Roboto', value: 'Roboto' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [branding, setBranding] = useState(storageService.getBranding());
  const [logoPreview, setLogoPreview] = useState(branding.logo);
  const [saved, setSaved] = useState(false);

  const user = authService.getCurrentUser();
  const activeTheme = theme === 'light' || theme === 'dark' ? theme : 'light';

  useEffect(() => {
    runtimeAuthIsAuthenticated().then((isAuth) => {
      if (!isAuth) {
        runtimeRedirectToLogin();
      }
    });
  }, [navigate]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
        setBranding((prev) => ({ ...prev, logo: event.target.result }));
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
  };

  const goBack = () => {
    if (user?.role === 'teacher') {
      navigate(createPageUrl('TeacherDashboard'));
    } else {
      navigate(createPageUrl('Profile'));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="glass-card sticky top-0 z-30 rounded-none border-b border-border px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="text-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">Settings</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <Card className="glass-panel border-0 shadow-none">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 rounded-xl border-2 p-6 transition-all ${
                  activeTheme === 'dark'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="mb-2 text-4xl">🌙</div>
                <p className="font-medium text-foreground">Dark</p>
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex-1 rounded-xl border-2 p-6 transition-all ${
                  activeTheme === 'light'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="mb-2 text-4xl">☀️</div>
                <p className="font-medium text-foreground">Light</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 shadow-none">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">
                <Upload className="mb-0.5 mr-2 inline h-4 w-4" />
                Logo
              </label>
              <div
                role="button"
                tabIndex={0}
                onClick={() => document.getElementById('logoInput').click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') document.getElementById('logoInput').click();
                }}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50"
              >
                <input
                  id="logoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="mx-auto h-20 w-20 rounded-xl object-contain" />
                ) : (
                  <>
                    <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">
                <Palette className="mb-0.5 mr-2 inline h-4 w-4" />
                Primary Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <motion.button
                    key={color.value}
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBranding((prev) => ({ ...prev, primaryColor: color.value }))}
                    className={`h-12 w-12 rounded-xl transition-all ${
                      branding.primaryColor === color.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">
                <Type className="mb-0.5 mr-2 inline h-4 w-4" />
                Font Family
              </label>
              <div className="grid grid-cols-3 gap-3">
                {FONTS.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => setBranding((prev) => ({ ...prev, font: font.value }))}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      branding.font === font.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    <span className="text-lg font-medium text-foreground">Aa</span>
                    <p className="mt-1 text-xs text-muted-foreground">{font.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border border-border shadow-none">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: branding.primaryColor, fontFamily: branding.font }}
            >
              <div className="mb-4 flex items-center gap-3">
                {logoPreview && <img src={logoPreview} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />}
                <span className="text-lg font-semibold text-white">Lumen Academy</span>
              </div>
              <p className="text-white/80">This is how your app will look with the selected branding.</p>
              <Button className="mt-4 bg-white text-slate-800 hover:bg-white/90">Sample Button</Button>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full py-6 font-medium" size="lg">
          {saved ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
