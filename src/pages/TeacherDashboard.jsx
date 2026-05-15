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
      color: 'bg-blue-500',
      trend: '+2 this month'
    },
    { 
      title: 'Active Students', 
      value: students.length, 
      icon: Users, 
      color: 'bg-emerald-500',
      trend: '+12% growth'
    },
    { 
      title: 'Avg. Mastery', 
      value: '84%', 
      icon: TrendingUp, 
      color: 'bg-violet-500',
      trend: '+5% vs last week'
    },
    { 
      title: 'Total Lessons', 
      value: courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0), 
      icon: Clock, 
      color: 'bg-amber-500',
      trend: `${courses.length * 5} minutes avg`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 lg:flex" style={{ background: '#212121' }}>
      <TeacherSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header style={{ background: 'rgba(33, 33, 33, 0.8)', borderBottom: '1px solid #333333', padding: '16px 24px' }}>
          <div className="flex items-center justify-between">
            <div className="lg:hidden" /> {/* Spacer for mobile menu button */}
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '100', color: '#00c600' }}>Dashboard</h1>
              <p style={{ fontSize: '14px', color: '#999999' }}>Welcome back, {user?.name || 'Teacher'}</p>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              style={{ background: '#00c600', color: '#000000', border: 'none', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: 'normal' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#00e600'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#00c600'}
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              New Course
            </button>
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
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.title}</p>
                      <p className="text-xs text-emerald-600 mt-1">{stat.trend}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Your Courses</h2>
              <Button variant="ghost" size="sm" className="text-blue-500">
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
              <h2 className="text-lg font-bold text-slate-800">Student Progress</h2>
              <Button variant="ghost" size="sm" className="text-blue-500">
                View All
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {students.slice(0, 5).map((student, index) => {
                    const progress = studentProgress.find(p => p.studentId === student.id);
                    const course = courses.find(c => c.id === progress?.courseId);
                    
                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                      >
                        <img 
                          src={student.avatar} 
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{student.name}</p>
                          <p className="text-sm text-slate-500 truncate">
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
                          'text-slate-500'
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