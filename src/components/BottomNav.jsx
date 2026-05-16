import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Home', page: 'StudentDashboard' },
    { icon: BookOpen, label: 'Courses', page: 'Courses' },
    { icon: User, label: 'Profile', page: 'Profile' }
  ];

  const isActive = (page) => {
    return location.pathname === createPageUrl(page);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] bg-white/55 shadow-[0_-8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl safe-area-pb">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            className="relative flex flex-col items-center justify-center flex-1 h-full"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={cn(
                'flex flex-col items-center gap-1 transition-colors',
                isActive(item.page) ? 'text-primary' : 'text-muted-foreground opacity-70'
              )}
            >
              <item.icon className="h-6 w-6 stroke-[1.5]" />
              <span className="text-xs font-normal">{item.label}</span>
              
              {isActive(item.page) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                />
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </nav>
  );
}