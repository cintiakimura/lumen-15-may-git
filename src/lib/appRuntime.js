import { isDemoMode, withDemoParam } from '@/lib/demoMode';
import { createPageUrl } from '@/utils';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';
import { lumen } from '@/api/lumenClient';

function mapLocalUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    full_name: u.name,
    role: u.role,
  };
}

export async function runtimeAuthIsAuthenticated() {
  if (isDemoMode()) return authService.isAuthenticated();
  return lumen.auth.isAuthenticated();
}

export function runtimeRedirectToLogin() {
  if (isDemoMode()) {
    window.location.assign(withDemoParam(createPageUrl('Login')));
    return;
  }
  lumen.auth.redirectToLogin();
}

export async function runtimeAuthMe() {
  if (isDemoMode()) {
    const u = authService.getCurrentUser();
    if (!u) {
      const err = new Error('Not authenticated');
      err.status = 401;
      throw err;
    }
    return mapLocalUser(u);
  }
  return lumen.auth.me();
}

export async function runtimeUpdateMe(payload) {
  if (isDemoMode()) {
    return mapLocalUser(authService.getCurrentUser());
  }
  return lumen.auth.updateMe(payload);
}

export async function runtimeLogout(redirectHref) {
  if (isDemoMode()) {
    authService.logout();
    window.location.assign(withDemoParam(createPageUrl('Landing')));
    return;
  }
  if (redirectHref) {
    await lumen.auth.logout(redirectHref);
  } else {
    await lumen.auth.logout();
  }
}

export async function runtimePublishedCourses() {
  if (isDemoMode()) {
    return storageService.getCourses().filter((c) => c.is_published);
  }
  return lumen.entities.Course.filter({ is_published: true });
}

export async function runtimeTeacherCourses() {
  if (isDemoMode()) {
    return storageService.getCourses();
  }
  const user = await lumen.auth.me();
  return lumen.entities.Course.filter({ teacher_id: user.id });
}

export async function runtimeListCoursesForLookup() {
  if (isDemoMode()) {
    return storageService.getCourses();
  }
  return lumen.entities.Course.list();
}

export async function runtimeStudentProgress(courseId) {
  if (isDemoMode()) {
    const u = authService.getCurrentUser();
    if (!u) return { id: undefined, completedLessons: [], mastery: 0 };
    const byCourse = storageService.getProgress(u.id)[courseId];
    if (!byCourse) return { id: undefined, completedLessons: [], mastery: 0 };
    return {
      id: byCourse.id,
      completedLessons:
        byCourse.completedLessons || byCourse.completed_lessons || [],
      mastery: byCourse.mastery ?? byCourse.mastery_score ?? 0,
    };
  }
  const user = await lumen.auth.me();
  const allProgress = await lumen.entities.StudentProgress.filter({
    student_id: user.id,
    course_id: courseId,
  });
  const row = allProgress[0];
  if (!row) return { id: undefined, completedLessons: [], mastery: 0 };
  return {
    id: row.id,
    completedLessons: row.completed_lessons || row.completedLessons || [],
    mastery: row.mastery_score ?? row.mastery ?? 0,
  };
}

export async function runtimeSaveLessonProgress(
  courseId,
  progress,
  course,
  lessonId
) {
  const user = await runtimeAuthMe();
  const newCompletedLessons = [...(progress.completedLessons || []), lessonId];
  const progressData = {
    student_id: user.id,
    course_id: courseId,
    completed_lessons: newCompletedLessons,
    mastery_score: progress.mastery || 0,
    certificate_earned: newCompletedLessons.length === course?.lessons?.length,
  };

  if (isDemoMode()) {
    storageService.setProgress(user.id, courseId, {
      id: progress.id || `prog-${courseId}-${user.id}`,
      completedLessons: newCompletedLessons,
      completed_lessons: newCompletedLessons,
      mastery: progressData.mastery_score,
      mastery_score: progressData.mastery_score,
      certificate_earned: progressData.certificate_earned,
    });
    return;
  }

  if (progress.id) {
    await lumen.entities.StudentProgress.update(progress.id, progressData);
  } else {
    await lumen.entities.StudentProgress.create(progressData);
  }
}

export async function runtimeSaveMasteryProgress(courseId, progress, score) {
  const user = await runtimeAuthMe();
  const progressData = {
    student_id: user.id,
    course_id: courseId,
    completed_lessons: progress.completedLessons || [],
    mastery_score: score,
  };

  if (isDemoMode()) {
    storageService.setProgress(user.id, courseId, {
      id: progress.id || `prog-${courseId}-${user.id}`,
      completedLessons: progress.completedLessons || [],
      completed_lessons: progress.completedLessons || [],
      mastery: score,
      mastery_score: score,
    });
    return;
  }

  if (progress.id) {
    await lumen.entities.StudentProgress.update(progress.id, progressData);
  } else {
    await lumen.entities.StudentProgress.create(progressData);
  }
}

export async function runtimeInvokeStructureCourse(body) {
  if (isDemoMode()) {
    return {
      data: {
        success: true,
        lessons: [
          {
            id: 'l1',
            title: 'Demo lesson 1',
            format: 'audio',
            content: 'Local demo: structured outline would appear here after AI processing.',
            duration: 5,
          },
          {
            id: 'l2',
            title: 'Demo lesson 2',
            format: 'visual',
            content: 'Second micro-lesson placeholder.',
            duration: 5,
          },
        ],
      },
    };
  }
  return lumen.functions.invoke('structureCourse', body);
}

export async function runtimeInvokeChatWithGrok(body) {
  if (isDemoMode()) {
    return {
      data: {
        response:
          'Demo mode: live AI is off. Try removing ?demo=true when connected to the platform.',
        mastery_score: 70,
        is_frustrated: false,
      },
    };
  }
  return lumen.functions.invoke('chatWithGrok', body);
}

export async function runtimeCreateCourse(payload) {
  if (isDemoMode()) {
    storageService.addCourse({
      ...payload,
      teacher_id: authService.getCurrentUser()?.id,
    });
    return;
  }
  await lumen.entities.Course.create(payload);
}
