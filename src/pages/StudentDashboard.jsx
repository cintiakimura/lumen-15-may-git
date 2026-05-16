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
  runtimeAssignedCoursesForStudent,
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

  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ['assigned-courses'],
    queryFn: () => runtimeAssignedCoursesForStudent(),
    initialData: [],
  });

  const { data: browseCourses = [] } = useQuery({
    queryKey: ['published-courses'],
    queryFn: () => runtimePublishedCourses(),
    initialData: [],
  });
  
  const totalLessons = enrolledCourses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
  const completedLessons = Object.values(progress).reduce(
    (sum, p) => sum + (p?.completedLessons?.length || 0), 0
  );
  const avgMastery = Object.values(progress).length > 0
    ? Math.round(Object.values(progress).reduce((sum, p) => sum + (p?.mastery || 0), 0) / Object.values(progress).length)
    : 0;

  const handleCourseClick = (course) => {
    navigate(createPageUrl('CourseModule') + `?id=${course.id}`);
  };

  // Get current lesson to continue
  const currentCourse = enrolledCourses[0];
  const currentProgress = progress[currentCourse?.id] || { completedLessons: [] };
  const currentLessonIndex = currentProgress.completedLessons?.length || 0;
  const currentLesson = currentCourse?.lessons?.[currentLessonIndex];

  return (
    <div className="min-h-screen bg-background pb-64">
      {/* Header */}
      <header className="lumen-glass-nav rounded-b-[2.5rem] px-6 pb-8 pt-12 shadow-soft">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Welcome back,</p>
          <h1 className="mb-6 text-3xl font-light text-foreground">{user?.name || 'Learner'}</h1>

          {/* Continue Learning Card */}
          {currentLesson && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-panel border border-black/[0.06] shadow-sm">
                <CardContent className="p-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Continue Learning</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-normal text-foreground">{currentLesson.title}</h3>
                      <p className="text-sm text-muted-foreground">{currentCourse.title}</p>
                    </div>
                    <Button
                      onClick={() => handleCourseClick(currentCourse)}
                      className="font-normal"
                      variant="default"
                    >
                      <Play className="mr-1 h-4 w-4" />
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
        <Card className="glass-panel max-w-full overflow-hidden border-0 p-0 shadow-glass">
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-border/80">
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
                  <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-xl font-light text-foreground">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-normal text-foreground">My Courses</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-primary hover:text-primary/90"
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
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-normal text-foreground">Recommended</h2>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {browseCourses.slice(0, 4).map((course, index) => (
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
          <Card className="glass-panel border-0 shadow-glass">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wider text-muted-foreground">Daily Goal</p>
                  <p className="mt-1 text-3xl font-light text-foreground">
                    {completedLessons} / 3 lessons
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-[6px] border border-black/[0.06] bg-white/70 shadow-sm backdrop-blur-sm">
                  <Clock className="h-8 w-8 stroke-[1.5] text-primary" />
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