import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  BookOpen,
  Award,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TeacherSidebar from '@/components/TeacherSidebar';
import ProgressBar from '@/components/ui/ProgressBar';
import storageService from '@/components/services/storageService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
} from '@/lib/appRuntime';

export default function TeacherAnalytics() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const courses = storageService.getCourses();
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

  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', students: 12, lessons: 45 },
    { day: 'Tue', students: 19, lessons: 52 },
    { day: 'Wed', students: 15, lessons: 38 },
    { day: 'Thu', students: 22, lessons: 61 },
    { day: 'Fri', students: 18, lessons: 48 },
    { day: 'Sat', students: 8, lessons: 23 },
    { day: 'Sun', students: 5, lessons: 15 }
  ];

  const masteryDistribution = [
    { name: 'Excellent (85-100%)', value: 35, color: '#10B981' },
    { name: 'Good (70-84%)', value: 40, color: '#3B82F6' },
    { name: 'Needs Work (<70%)', value: 25, color: '#F59E0B' }
  ];

  const courseCompletion = courses.map(course => ({
    name: course.title.split(' ').slice(0, 2).join(' '),
    completion: Math.floor(Math.random() * 40) + 60
  }));

  const stats = [
    { 
      title: 'Total Students', 
      value: students.length, 
      change: '+12%',
      trend: 'up',
      icon: Users
    },
    { 
      title: 'Avg. Mastery', 
      value: '84%', 
      change: '+5%',
      trend: 'up',
      icon: TrendingUp
    },
    { 
      title: 'Certificates Issued', 
      value: 23, 
      change: '+8',
      trend: 'up',
      icon: Award
    },
    { 
      title: 'Active Courses', 
      value: courses.length, 
      change: '+2',
      trend: 'up',
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-background lg:flex">
      <TeacherSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1">
        <header className="glass-card border-b border-border px-6 py-4 lg:px-8">
          <div className="lg:hidden" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-[#a0a0a0]">Track student progress and course performance</p>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15"
                      >
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        stat.trend === 'up' ? 'text-primary' : 'text-red-400'
                      }`}>
                        {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {stat.change}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-[#a0a0a0]">{stat.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <Card className="glass-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }}
                      />
                      <Bar dataKey="lessons" fill={branding.primaryColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Mastery Distribution */}
            <Card className="glass-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Mastery Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={masteryDistribution}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {masteryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {masteryDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-slate-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Completion */}
          <Card className="glass-card border border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Course Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseCompletion.map((course, index) => (
                  <motion.div
                    key={course.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <span className="w-32 text-sm text-foreground truncate">{course.name}</span>
                    <div className="flex-1">
                      <ProgressBar value={course.completion} showLabel={false} />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">
                      {course.completion}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="glass-card border border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Top Performing Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {students.slice(0, 5).map((student, index) => {
                  const progress = studentProgress.find(p => p.studentId === student.id);
                  return (
                    <div key={student.id} className="flex items-center gap-4 py-3">
                      <span className="text-lg font-bold text-[#a0a0a0] w-6">#{index + 1}</span>
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-[#a0a0a0]">{student.email}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        (progress?.mastery || 0) >= 85 
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/40 text-foreground'
                      }`}>
                        {progress?.mastery || 0}% mastery
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}