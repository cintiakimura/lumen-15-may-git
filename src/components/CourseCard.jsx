import React from 'react';
import { Clock, BookOpen, Award, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function CourseCard({ course, progress, onClick, variant = 'default', className }) {
  const totalLessons = course.lessons?.length || 0;
  const completedLessons = progress?.completed_lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const totalDuration = course.lessons?.reduce((sum, l) => sum + (l.duration || 5), 0) || 0;

  const categoryLabels = {
    auto_repair: 'Auto Repair',
    welding: 'Welding',
    sales: 'Sales',
    accounting: 'Accounting',
    other: 'General',
  };

  if (variant === 'compact') {
    return (
      <motion.div
        onClick={onClick}
        className={cn('glass-card-surface flex h-full min-h-0 cursor-pointer flex-col p-6', className)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="mb-1 text-base font-normal text-foreground">{course.title}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{totalLessons} lessons</span>
              <span>{totalDuration} min</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      className={cn('glass-card-surface flex h-full min-h-0 cursor-pointer flex-col overflow-hidden', className)}
    >
      <div className="relative h-40 overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-muted/60" />
        )}

        <span className="absolute left-3 top-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-normal uppercase tracking-wide text-primary-foreground">
          {categoryLabels[course.category] || 'Course'}
        </span>

        {progressPercent === 100 && (
          <div className="absolute right-3 top-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Award className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-6">
        <h3 className="mb-2 text-2xl font-normal leading-tight text-foreground sm:text-3xl">{course.title}</h3>

        <p className="mb-4 min-h-0 flex-1 text-base font-normal leading-relaxed text-muted-foreground">
          {course.description || 'No description available'}
        </p>

        <div className="mb-4 flex items-center gap-4 text-sm font-normal text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {totalLessons} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {totalDuration} min
          </span>
        </div>

        {progress && (
          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-normal text-muted-foreground">
              <span>
                {completedLessons}/{totalLessons} completed
              </span>
              <span className="text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="progress-fill"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
