import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Sparkles,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import CourseCard from '@/components/CourseCard';
import ProgressBar from '@/components/ui/ProgressBar';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
  runtimePublishedCourses,
} from '@/lib/appRuntime';
import { useQuery } from '@tanstack/react-query';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState({});
  
  const user = authService.getCurrentUser();
  const branding = storageService.getBranding();

  useEffect(() => {
    runtimeAuthIsAuthenticated().then((isAuth) => {
      if (!isAuth) {
        runtimeRedirectToLogin();
      }
    });
  }, [navigate]);

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => runtimePublishedCourses(),
    initialData: []
  });

  const enrolledCourses = courses.slice(0, 3); // Mock enrolled courses
  
  const totalLessons = enrolledCourses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
  const completedLessons = Object.values(progress).reduce(
    (sum, p) => sum + (p?.completedLessons?.length || 0), 0
  );
  const avgMastery = Object.values(progress).length > 0
    ? Math.round(Object.values(progress).reduce((sum, p) => sum + (p?.mastery || 0), 0) / Object.values(progress).length)
    : 0;

  const handleCourseClick = (course) => {
    navigate(createPageUrl('CourseDetail') + `?id=${course.id}`);
  };

  // Get current lesson to continue
  const currentCourse = enrolledCourses[0];
  const currentProgress = progress[currentCourse?.id] || { completedLessons: [] };
  const currentLessonIndex = currentProgress.completedLessons?.length || 0;
  const currentLesson = currentCourse?.lessons?.[currentLessonIndex];

  return (
    <div className="min-h-screen pb-64" style={{ background: '#212121' }}>
      {/* Header */}
      <header 
        className="px-6 pt-12 pb-8"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
          borderRadius: '0 0 40px 40px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-white/60 text-sm uppercase tracking-wider">Welcome back,</p>
          <h1 className="text-3xl font-bold text-white mb-6">{user?.name || 'Learner'}</h1>
          
          {/* Continue Learning Card */}
          {currentLesson && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card style={{ background: 'var(--primary)', border: 0, boxShadow: 'var(--card-shadow)' }}>
                <CardContent className="p-4">
                  <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--bg)', opacity: 0.7 }}>Continue Learning</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: 'var(--bg)' }}>{currentLesson.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--bg)', opacity: 0.7 }}>{currentCourse.title}</p>
                    </div>
                    <Button
                      onClick={() => handleCourseClick(currentCourse)}
                      style={{ background: 'var(--bg)', color: 'var(--text)' }}
                      className="font-semibold hover:opacity-90"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  </div>
                  <div className="mt-3">
                    <ProgressBar 
                      value={currentLessonIndex}
                      max={currentCourse.lessons?.length || 1}
                      showLabel={false}
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </header>

      <div className="px-6 -mt-4 space-y-6">
        {/* Quick Stats */}
        <Card style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid #333333', maxWidth: '100%', width: '100%', padding: 0, margin: 0, borderRadius: '16px' }}>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--glass-border)' }}>
              {[
                { icon: BookOpen, value: enrolledCourses.length, label: 'Courses' },
                { icon: Trophy, value: completedLessons, label: 'Lessons' },
                { icon: TrendingUp, value: `${avgMastery}%`, label: 'Mastery' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="p-5 text-center"
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
                  <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>My Courses</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm"
              style={{ color: 'var(--primary)' }}
              onClick={() => navigate(createPageUrl('Courses'))}
            >
              See All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {enrolledCourses.map((course, index) => {
              const courseProgress = progress[course.id];
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    progress={courseProgress}
                    variant="compact"
                    onClick={() => handleCourseClick(course)}
                  />
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Recommended */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Recommended</h2>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {courses.slice(0, 4).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-64"
              >
                <CourseCard
                  course={course}
                  onClick={() => handleCourseClick(course)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Daily Goal */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #333333', backdropFilter: 'blur(8px)', borderRadius: '16px' }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Daily Goal</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text)' }}>
                    {completedLessons} / 3 lessons
                  </p>
                </div>
                <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar 
                  value={completedLessons}
                  max={3}
                  showLabel={false}
                  size="md"
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      <BottomNav />
    </div>
  );
}