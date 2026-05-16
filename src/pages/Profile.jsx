import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  User, 
  Mail, 
  Award, 
  BookOpen, 
  Clock, 
  LogOut,
  ChevronRight,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import ThemeToggle from '@/components/ui/ThemeToggle';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
} from '@/lib/appRuntime';
import { useAuth } from '@/lib/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  
  const branding = storageService.getBranding();

  useEffect(() => {
    runtimeAuthIsAuthenticated().then((isAuth) => {
      if (!isAuth) {
        runtimeRedirectToLogin();
      }
    });
    setUser(authService.getCurrentUser());
    setCourses(storageService.getCourses());
    setProgress(storageService.getProgress(authService.getCurrentUser()?.id));
  }, [navigate]);

  const handleLogout = async () => {
    await logout(true);
  };

  const completedCourses = Object.values(progress).filter(p => 
    p?.certificate_earned
  ).length;
  
  const totalLessonsCompleted = Object.values(progress).reduce(
    (sum, p) => sum + (p?.completedLessons?.length || 0), 0
  );

  const totalTime = totalLessonsCompleted * 5; // 5 min per lesson

  const menuItems = [
    { icon: Bell, label: 'Notifications', badge: '3' },
    { icon: Palette, label: 'Appearance' },
    { icon: Shield, label: 'Privacy & Security' },
    { icon: HelpCircle, label: 'Help & Support' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-64">
      {/* Header */}
      <div 
        className="px-6 pt-12 pb-24 rounded-b-3xl bg-gradient-to-br from-primary to-primary/80"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-primary-foreground">Profile</h1>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate(createPageUrl('Settings'))}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">{user.name}</h2>
          <p className="mt-1 flex items-center justify-center gap-2 text-primary-foreground/80">
            <Mail className="w-4 h-4" />
            {user.email}
          </p>
        </motion.div>
      </div>

      <div className="px-6 -mt-16 space-y-6">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border border-border">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x divide-border">
                {[
                  { icon: Award, value: completedCourses, label: 'Certificates' },
                  { icon: BookOpen, value: totalLessonsCompleted, label: 'Lessons' },
                  { icon: Clock, value: `${totalTime}m`, label: 'Time Spent' }
                ].map((stat, index) => (
                  <div key={stat.label} className="p-5 text-center">
                    <stat.icon 
                      className="w-6 h-6 mx-auto mb-2 text-primary"
                    />
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-[#a0a0a0]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-foreground mb-3">Achievements</h3>
          <Card className="glass-card border border-border">
            <CardContent className="p-4">
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {[
                  { emoji: '🎯', label: 'First Lesson', earned: totalLessonsCompleted >= 1 },
                  { emoji: '🔥', label: '3-Day Streak', earned: false },
                  { emoji: '🌟', label: 'Perfect Score', earned: false },
                  { emoji: '🏆', label: 'Course Complete', earned: completedCourses >= 1 },
                  { emoji: '💪', label: '10 Lessons', earned: totalLessonsCompleted >= 10 }
                ].map((achievement) => (
                  <div 
                    key={achievement.label}
                    className={`flex-shrink-0 w-20 text-center p-3 rounded-xl ${
                      achievement.earned ? 'border border-primary bg-primary/15' : 'bg-muted opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{achievement.emoji}</span>
                    <p className="text-xs text-[#a0a0a0] mt-1">{achievement.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Settings Menu */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-foreground mb-3">Settings</h3>
          <Card className="glass-card border border-border">
            <CardContent className="p-0 divide-y divide-border">
              {menuItems.map((item) => (
                <button 
                  key={item.label}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#a0a0a0]" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground">
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground"
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#a0a0a0]" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full py-6 text-red-400 border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}