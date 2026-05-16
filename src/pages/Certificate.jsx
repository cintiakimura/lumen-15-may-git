import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isDemoMode } from '@/lib/demoMode';
import { runtimeAuthIsAuthenticated, runtimeAuthMe, runtimeRedirectToLogin } from '@/lib/appRuntime';
import storageService from '@/components/services/storageService';
import certificateService from '@/components/services/certificateService';

export default function Certificate() {
  useEffect(() => {
    runtimeAuthIsAuthenticated().then((ok) => {
      if (!ok) runtimeRedirectToLogin();
    });
  }, []);

  const { data: completed = [] } = useQuery({
    queryKey: ['certificate-completions'],
    queryFn: async () => {
      if (!isDemoMode()) return [];
      const user = await runtimeAuthMe();
      const progressMap = storageService.getProgress(user.id);
      const courses = storageService.getCourses();
      return courses
        .filter((c) => {
          const p = progressMap[c.id];
          if (!p?.completedLessons?.length) return false;
          const total = c.lessons?.length || 0;
          return total > 0 && p.completedLessons.length >= total;
        })
        .map((c) => ({
          id: c.id,
          title: c.title,
          mastery: progressMap[c.id]?.mastery ?? progressMap[c.id]?.mastery_score ?? 0,
        }));
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Courses you&apos;ve fully completed — download a PDF for your records.
        </p>
      </div>

      {!isDemoMode() && (
        <p className="text-sm text-muted-foreground">
          Hosted mode: connect your backend to list issued certificates here.
        </p>
      )}

      <div className="space-y-4">
        {completed.map((row) => (
          <Card key={row.id} className="glass-panel border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base">{row.title}</CardTitle>
                <p className="text-xs text-muted-foreground">Mastery: {Math.round(row.mastery)}%</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={async () => {
                  const user = await runtimeAuthMe();
                  certificateService.generateCertificate(
                    row.title,
                    user?.full_name || 'Learner',
                    Math.round(row.mastery) || 85
                  );
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Issued when you finished every module in this course.
            </CardContent>
          </Card>
        ))}
      </div>

      {isDemoMode() && completed.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Finish a full course in the module player to unlock a certificate here.
        </p>
      )}
    </div>
  );
}
