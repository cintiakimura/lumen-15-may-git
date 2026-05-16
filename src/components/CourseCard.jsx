import React from 'react';
import { Clock, BookOpen, Award, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function CourseCard({ 
  course, 
  progress,
  onClick,
  variant = 'default',
  className 
}) {
  const totalLessons = course.lessons?.length || 0;
  const completedLessons = progress?.completed_lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const totalDuration = course.lessons?.reduce((sum, l) => sum + (l.duration || 5), 0) || 0;

  const categoryLabels = {
    auto_repair: 'Auto Repair',
    welding: 'Welding',
    sales: 'Sales',
    accounting: 'Accounting',
    other: 'General'
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className={cn('cursor-pointer transition-all', className)}
        style={{ 
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'hsl(var(--primary))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen style={{ width: '24px', height: '24px', color: 'hsl(var(--primary-foreground))' }} />
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
              {course.title}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <span>{totalLessons} lessons</span>
              <span>{totalDuration} min</span>
            </div>
          </div>
          <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn('cursor-pointer transition-all overflow-hidden', className)}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        boxShadow: 'var(--card-shadow)'
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            background: 'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--surface-light)) 100%)' 
          }} />
        )}
        
        {/* Category badge */}
        <span 
          style={{ 
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            background: 'hsl(var(--primary))', 
            color: 'hsl(var(--primary-foreground))',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
          {categoryLabels[course.category] || 'Course'}
        </span>

        {/* Certificate badge if completed */}
        {progressPercent === 100 && (
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'hsl(var(--primary))', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: 'var(--card-shadow)'
            }}>
              <Award style={{ width: '16px', height: '16px', color: 'hsl(var(--primary-foreground))' }} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '32px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
          {course.title}
        </h3>
        
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
          {course.description || 'No description available'}
        </p>

        {/* Meta info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen style={{ width: '16px', height: '16px' }} />
            {totalLessons} lessons
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock style={{ width: '16px', height: '16px' }} />
            {totalDuration} min
          </span>
        </div>

        {/* Progress */}
        {progress && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {completedLessons}/{totalLessons} completed
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--primary))' }}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="progress-fill"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}