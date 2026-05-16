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
  Palette,
  Target,
  Flame,
  Star,
  Trophy,
  Dumbbell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
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
      <div className="lumen-glass-nav rounded-b-3xl px-0 pb-24 pt-12 text-left">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-normal text-foreground">Profile</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-black/[0.04]"
              onClick={() => navigate(createPageUrl('Settings'))}
            >
              <Settings className="h-5 w-5 stroke-[1.5]" />
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-black/[0.06] bg-white/70 shadow-md backdrop-blur-md">
            <User className="h-12 w-12 text-muted-foreground stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-light text-foreground">{user.name}</h2>
          <p className="mt-1 flex items-center justify-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 stroke-[1.5]" />
            {user.email}
          </p>
        </motion.div>
      </div>

      <div className="-mt-16 space-y-5 text-left">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
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
                    <p className="text-xl font-light text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
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
          <h3 className="mb-3 text-lg font-normal text-foreground">Achievements</h3>
          <Card>
            <CardContent className="p-4">
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
                {[
                  { Icon: Target, label: 'First Lesson', earned: totalLessonsCompleted >= 1 },
                  { Icon: Flame, label: '3-Day Streak', earned: false },
                  { Icon: Star, label: 'Perfect Score', earned: false },
                  { Icon: Trophy, label: 'Course Complete', earned: completedCourses >= 1 },
                  { Icon: Dumbbell, label: '10 Lessons', earned: totalLessonsCompleted >= 10 },
                ].map((achievement) => (
                  <div
                    key={achievement.label}
                    className={`flex w-20 flex-shrink-0 flex-col items-center rounded-[6px] p-3 text-center ${
                      achievement.earned
                        ? 'border border-primary/30 bg-white/70 shadow-sm backdrop-blur-sm'
                        : 'border border-transparent bg-muted/50 opacity-60'
                    }`}
                  >
                    <achievement.Icon className="h-6 w-6 stroke-[1.5] text-foreground/70" aria-hidden />
                    <p className="mt-1 text-xs text-muted-foreground">{achievement.label}</p>
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
          <h3 className="mb-3 text-lg font-normal text-foreground">Settings</h3>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-white/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-black/[0.06] bg-white/60 backdrop-blur-sm">
                    <item.icon className="h-5 w-5 text-muted-foreground stroke-[1.5]" />
                  </div>
                  <span className="flex-1 text-left font-normal text-foreground">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-normal text-primary-foreground">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground stroke-[1.5]" />
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