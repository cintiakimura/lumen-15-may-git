import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import CourseCard from '@/components/CourseCard';
import storageService from '@/components/services/storageService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
  runtimePublishedCourses,
} from '@/lib/appRuntime';
import { useQuery } from '@tanstack/react-query';

const CATEGORIES = [
  { id: 'all', label: 'All Courses' },
  { id: 'auto_repair', label: 'Auto Repair' },
  { id: 'welding', label: 'Welding' },
  { id: 'sales', label: 'Sales' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'other', label: 'Other' }
];

export default function Courses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const branding = storageService.getBranding();

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => runtimePublishedCourses(),
    initialData: []
  });

  useEffect(() => {
    runtimeAuthIsAuthenticated().then((isAuth) => {
      if (!isAuth) {
        runtimeRedirectToLogin();
      }
    });
  }, [navigate]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCourseClick = (course) => {
    navigate(createPageUrl('CourseModule') + `?id=${course.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="lumen-glass-nav sticky top-0 z-30 px-6 py-4">
        <h1 className="mb-4 text-2xl font-light text-foreground">Explore Courses</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[1.5] text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="rounded-[6px] border-border py-5 pl-12"
          />
        </div>
      </header>

      <div className="px-6 py-4">
        {/* Category Filters */}
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-4 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex-shrink-0 rounded-[6px] font-normal',
                activeCategory === category.id && 'text-primary-foreground'
              )}
              style={activeCategory === category.id ? { backgroundColor: branding.primaryColor } : {}}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-muted-foreground">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
        </p>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CourseCard
                  course={course}
                  onClick={() => handleCourseClick(course)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No courses found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}