import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  size = 'md',
  showLabel = true,
  className,
  color
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">Progress</span>
          <span className="text-xs font-semibold text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full rounded-full overflow-hidden bg-muted',
        sizeClasses[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full transition-all duration-500',
            'bg-primary'
          )}
          style={color ? { backgroundColor: color } : {}}
        />
      </div>
    </div>
  );
}