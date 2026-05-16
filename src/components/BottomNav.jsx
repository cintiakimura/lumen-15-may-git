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
              whileTap={{ scale: 0.96 }}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-2xl border px-5 py-2 text-xs font-normal transition-all duration-200',
                isActive(item.page)
                  ? 'border-white/50 bg-white/70 text-foreground shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] backdrop-blur-md'
                  : 'border-transparent text-muted-foreground hover:border-white/35 hover:bg-white/45 hover:text-foreground hover:backdrop-blur-sm'
              )}
            >
              <item.icon className="h-6 w-6 stroke-[1.5]" />
              <span className="font-normal">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </nav>
  );
}