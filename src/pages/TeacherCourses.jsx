import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import TeacherSidebar from '@/components/TeacherSidebar';
import CourseCard from '@/components/CourseCard';
import UploadForm from '@/components/UploadForm';
import storageService from '@/components/services/storageService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
  runtimeTeacherCourses,
} from '@/lib/appRuntime';
import { useQuery } from '@tanstack/react-query';

export default function TeacherCourses() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [search, setSearch] = useState('');
  
  const branding = storageService.getBranding();

  useEffect(() => {
    runtimeAuthIsAuthenticated().then((isAuth) => {
      if (!isAuth) {
        runtimeRedirectToLogin();
      }
    });
  }, [navigate]);

  const { data: courses = [], refetch } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => runtimeTeacherCourses(),
    initialData: []
  });

  const handleCourseCreated = () => {
    refetch();
    setShowUploadForm(false);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <TeacherSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1">
        <header className="lumen-glass-nav px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="lg:hidden" />
            <div>
              <h1 className="text-2xl font-light text-foreground">My Courses</h1>
              <p className="text-sm text-muted-foreground">{courses.length} courses created</p>
            </div>
            <Button
              onClick={() => setShowUploadForm(true)}
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Course
            </Button>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[1.5] text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="pl-12 py-5 rounded-xl"
            />
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <CourseCard course={course} onClick={() => {}} />
                
                {/* Actions overlay */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="bg-white/90 backdrop-blur-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="w-4 h-4 mr-2" />
                        Assign Students
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {showUploadForm && (
        <UploadForm 
          onCourseCreated={handleCourseCreated}
          onClose={() => setShowUploadForm(false)}
        />
      )}
    </div>
  );
}