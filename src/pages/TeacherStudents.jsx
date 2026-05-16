import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Search,
  Mail,
  MoreVertical,
  UserPlus,
  Download,
  TrendingUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import TeacherSidebar from '@/components/TeacherSidebar';
import ProgressBar from '@/components/ui/ProgressBar';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  const students = storageService.getMockStudents();
  const studentProgress = storageService.getMockStudentProgress();
  const courses = storageService.getCourses();
  const branding = storageService.getBranding();

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isTeacher()) {
      navigate(createPageUrl('Login'));
    }
  }, [navigate]);

  const enrichedStudents = students.map(student => {
    const progress = studentProgress.filter(p => p.studentId === student.id);
    const avgMastery = progress.length > 0 
      ? Math.round(progress.reduce((sum, p) => sum + p.mastery, 0) / progress.length)
      : 0;
    const totalLessons = progress.reduce((sum, p) => sum + (p.completedLessons?.length || 0), 0);
    const assignedCourses = progress.map(p => courses.find(c => c.id === p.courseId)?.title).filter(Boolean);
    
    return {
      ...student,
      mastery: avgMastery,
      lessonsCompleted: totalLessons,
      courses: assignedCourses,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  });

  const filteredStudents = enrichedStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'excellent') return matchesSearch && student.mastery >= 85;
    if (filter === 'needsHelp') return matchesSearch && student.mastery < 70;
    return matchesSearch;
  });

  const formatLastActive = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      <TeacherSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1">
        <header className="glass-card border-b border-border px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="lg:hidden" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Students</h1>
              <p className="text-sm text-slate-500">{students.length} enrolled students</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button style={{ backgroundColor: branding.primaryColor }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-12 py-5 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'excellent', label: 'Excellent' },
                { id: 'needsHelp', label: 'Needs Help' }
              ].map((f) => (
                <Button
                  key={f.id}
                  variant={filter === f.id ? 'default' : 'outline'}
                  onClick={() => setFilter(f.id)}
                  className="rounded-full"
                  style={filter === f.id ? { backgroundColor: branding.primaryColor } : {}}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Students Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Student</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 hidden md:table-cell">Course</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Mastery</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 hidden lg:table-cell">Lessons</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 hidden lg:table-cell">Last Active</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img 
                              src={student.avatar} 
                              alt={student.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-slate-800">{student.name}</p>
                              <p className="text-sm text-slate-500">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <span className="text-sm text-slate-600">
                            {student.courses[0] || 'No course'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-20">
                              <ProgressBar value={student.mastery} showLabel={false} size="sm" />
                            </div>
                            <span className={`text-sm font-semibold ${
                              student.mastery >= 85 ? 'text-emerald-600' :
                              student.mastery >= 70 ? 'text-blue-600' :
                              'text-amber-600'
                            }`}>
                              {student.mastery}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden lg:table-cell">
                          <span className="text-sm text-slate-600">{student.lessonsCompleted}</span>
                        </td>
                        <td className="py-4 px-6 hidden lg:table-cell">
                          <span className="text-sm text-slate-500">
                            {formatLastActive(student.lastActive)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                View Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}