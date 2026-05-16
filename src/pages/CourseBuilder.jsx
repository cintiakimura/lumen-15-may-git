import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import UploadForm from '@/components/UploadForm';
import storageService from '@/components/services/storageService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
  runtimeSetCourseAssignments,
  runtimeTeacherCourses,
} from '@/lib/appRuntime';
import { useQuery } from '@tanstack/react-query';

export default function CourseBuilder() {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [lastCourseId, setLastCourseId] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState(() =>
    storageService.getMockStudents().map((s) => s.id)
  );

  useEffect(() => {
    runtimeAuthIsAuthenticated().then((ok) => {
      if (!ok) runtimeRedirectToLogin();
    });
  }, []);

  const { data: courses = [], refetch } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => runtimeTeacherCourses(),
    initialData: [],
  });

  const students = storageService.getMockStudents();

  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!lastCourseId) return;
    await runtimeSetCourseAssignments(lastCourseId, selectedStudents);
    refetch();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Course builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload raw content → AI structures modules → you review in the modal → assign learners → they see it on their
          dashboard.
        </p>
      </div>

      <Card className="glass-panel border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">1. Upload & structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={() => setShowUpload(true)}>
            Open upload wizard
          </Button>
          <p className="text-sm text-muted-foreground">
            After save, pick the course below to assign students (demo uses local roster).
          </p>
          <div className="flex flex-wrap gap-2">
            {courses.map((c) => (
              <Button
                key={c.id}
                type="button"
                variant={lastCourseId === c.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLastCourseId(c.id)}
              >
                {c.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">2. Assign learners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Empty selection means &quot;all learners&quot; can see the published course. Otherwise only selected IDs
            match (demo storage).
          </p>
          <div className="space-y-3">
            {students.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={selectedStudents.includes(s.id)}
                  onCheckedChange={() => toggleStudent(s.id)}
                />
                <span>{s.name}</span>
                <span className="text-muted-foreground">{s.email}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleAssign} disabled={!lastCourseId}>
              Save assignments for selected course
            </Button>
            <Button type="button" variant="outline" onClick={() => setSelectedStudents([])}>
              Clear selection (open to all)
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(createPageUrl('TeacherCourses'))}>
              Back to courses
            </Button>
          </div>
        </CardContent>
      </Card>

      {showUpload && (
        <UploadForm
          onClose={() => setShowUpload(false)}
          onCourseCreated={(created) => {
            setShowUpload(false);
            if (created?.id) setLastCourseId(created.id);
            refetch();
          }}
        />
      )}
    </div>
  );
}
