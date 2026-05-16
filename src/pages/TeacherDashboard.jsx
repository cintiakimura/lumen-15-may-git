import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  BookOpen, 
  Users, 
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import TeacherSidebar from '@/components/TeacherSidebar';
import UploadForm from '@/components/UploadForm';
import CourseCard from '@/components/CourseCard';
import ProgressBar from '@/components/ui/ProgressBar';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
  runtimeTeacherCourses,
} from '@/lib/appRuntime';
import { useQuery } from '@tanstack/react-query';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const user = authService.getCurrentUser();
  const students = storageService.getMockStudents();
  const studentProgress = storageService.getMockStudentProgress();
  const branding = storageService.getBranding();

  useEffect(() => {
    runtimeAuthIsAuthenticated().then((isAuth) => {
      if (!isAuth) {
        runtimeRedirectToLogin();
      }
    });
  }, [navigate]);

  const { data: courses = [] } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => runtimeTeacherCourses(),
    initialData: []
  });

  const handleCourseCreated = () => {
    setShowUploadForm(false);
  };

  const stats = [
    {
      title: 'Total Courses',
      value: courses.length,
      icon: BookOpen,
      trend: '+2 this month',
    },
    {
      title: 'Active Students',
      value: students.length,
      icon: Users,
      trend: '+12% growth',
    },
    {
      title: 'Avg. Mastery',
      value: '84%',
      icon: TrendingUp,
      trend: '+5% vs last week',
    },
    {
      title: 'Total Lessons',
      value: courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0),
      icon: Clock,
      trend: `${courses.length * 5} minutes avg`,
    },
  ];

  return (
    <div className="min-h-screen bg-background lg:flex">
      <TeacherSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 lg:ml-0">
        <header className="lumen-glass-nav px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="lg:hidden" />
            <div>
              <h1 className="text-2xl font-light tracking-tight text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'Teacher'}</p>
            </div>
            <Button onClick={() => setShowUploadForm(true)} className="gap-2 rounded-[6px] font-normal">
              <Plus className="mr-0 inline h-4 w-4 stroke-[1.5]" />
              New Course
            </Button>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-8 pb-64">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-panel border border-black/[0.06] shadow-none transition-shadow hover:shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-black/[0.06] bg-primary/10">
                        <stat.icon className="h-5 w-5 stroke-[1.5] text-primary" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground stroke-[1.5]" />
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-light text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.trend}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-normal text-foreground">Your Courses</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard 
                    course={course}
                    onClick={() => {}}
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Student Progress */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-normal text-foreground">Student Progress</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
            
            <Card className="glass-panel overflow-hidden border border-black/[0.06] shadow-none">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {students.slice(0, 5).map((student, index) => {
                    const progress = studentProgress.find(p => p.studentId === student.id);
                    const course = courses.find(c => c.id === progress?.courseId);
                    
                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                      >
                        <img 
                          src={student.avatar} 
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-foreground">{student.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {course?.title || 'No course assigned'}
                          </p>
                        </div>
                        <div className="w-32 hidden sm:block">
                          <ProgressBar 
                            value={progress?.mastery || 0} 
                            showLabel={false}
                            size="sm"
                          />
                        </div>
                        <span className={`text-sm font-semibold ${
                          (progress?.mastery || 0) >= 85 ? 'text-emerald-600' :
                          (progress?.mastery || 0) >= 50 ? 'text-amber-600' :
                          'text-muted-foreground'
                        }`}>
                          {progress?.mastery || 0}%
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <UploadForm 
          onCourseCreated={handleCourseCreated}
          onClose={() => setShowUploadForm(false)}
        />
      )}
    </div>
  );
}