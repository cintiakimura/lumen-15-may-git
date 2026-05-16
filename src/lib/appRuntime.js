import { isDemoMode, withDemoParam } from '@/lib/demoMode';
import { createPageUrl } from '@/utils';
import authService from '@/components/services/authService';
import storageService from '@/components/services/storageService';
import { lumen } from '@/api/lumenClient';
import { analyzeLearnerSignals, coachDemoLessonReply } from '@/lib/grokCoach';
import { applyMasteryUnlockGate } from '@/lib/assessmentRemediation';

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
    window.location.assign(withDemoParam(createPageUrl('Landing')));
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
    if (!u) return { id: undefined, completedLessons: [], mastery: 0, coach_verified_lessons: [] };
    const byCourse = storageService.getProgress(u.id)[courseId];
    if (!byCourse) return { id: undefined, completedLessons: [], mastery: 0, coach_verified_lessons: [] };
    return {
      id: byCourse.id,
      completedLessons:
        byCourse.completedLessons || byCourse.completed_lessons || [],
      mastery: byCourse.mastery ?? byCourse.mastery_score ?? 0,
      coach_verified_lessons: byCourse.coach_verified_lessons || [],
    };
  }
  const user = await lumen.auth.me();
  const allProgress = await lumen.entities.StudentProgress.filter({
    student_id: user.id,
    course_id: courseId,
  });
  const row = allProgress[0];
  if (!row) return { id: undefined, completedLessons: [], mastery: 0, coach_verified_lessons: [] };
  return {
    id: row.id,
    completedLessons: row.completed_lessons || row.completedLessons || [],
    mastery: row.mastery_score ?? row.mastery ?? 0,
    coach_verified_lessons: row.coach_verified_lessons || [],
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
      coach_verified_lessons: progress.coach_verified_lessons || [],
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
      coach_verified_lessons: progress.coach_verified_lessons || [],
    });
    return;
  }

  if (progress.id) {
    await lumen.entities.StudentProgress.update(progress.id, progressData);
  } else {
    await lumen.entities.StudentProgress.create(progressData);
  }
}

export async function runtimeAppendCoachVerifiedLesson(courseId, progress, lessonId) {
  const user = await runtimeAuthMe();
  const merged = [...(progress.coach_verified_lessons || [])];
  if (!merged.includes(lessonId)) merged.push(lessonId);

  if (isDemoMode()) {
    const prev = storageService.getProgress(user.id)[courseId] || {};
    storageService.setProgress(user.id, courseId, {
      ...prev,
      id: progress.id || prev.id || `prog-${courseId}-${user.id}`,
      completedLessons: progress.completedLessons || prev.completedLessons || [],
      completed_lessons: progress.completedLessons || prev.completed_lessons || [],
      mastery: progress.mastery ?? prev.mastery ?? 0,
      mastery_score: progress.mastery ?? prev.mastery_score ?? 0,
      coach_verified_lessons: merged,
    });
    return;
  }

  const progressData = {
    student_id: user.id,
    course_id: courseId,
    completed_lessons: progress.completedLessons || [],
    mastery_score: progress.mastery ?? 0,
    coach_verified_lessons: merged,
  };

  if (progress.id) {
    await lumen.entities.StudentProgress.update(progress.id, progressData);
  } else {
    await lumen.entities.StudentProgress.create(progressData);
  }
}

export async function runtimeAssignedCoursesForStudent() {
  if (isDemoMode()) {
    const user = await runtimeAuthMe();
    const allowedIds = new Set(storageService.getAssignedCourseIdsForStudent(user.id));
    return storageService.getCourses().filter((c) => c.is_published && allowedIds.has(c.id));
  }
  const user = await lumen.auth.me();
  const published = await lumen.entities.Course.filter({ is_published: true });
  return published;
}

export async function runtimeSetCourseAssignments(courseId, studentIds) {
  if (isDemoMode()) {
    storageService.setCourseStudents(courseId, studentIds);
    return;
  }
  await lumen.entities.Course.update(courseId, { assigned_student_ids: studentIds });
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
    const signals = analyzeLearnerSignals({
      lastUserMessage: body.userMessage || '',
      priorMessages: Array.isArray(body.messageHistory) ? body.messageHistory : [],
    });
    return { data: applyMasteryUnlockGate(coachDemoLessonReply(signals)) };
  }
  return lumen.functions.invoke('chatWithGrok', body);
}

export async function runtimeCreateCourse(payload) {
  if (isDemoMode()) {
    return storageService.addCourse({
      ...payload,
      teacher_id: authService.getCurrentUser()?.id,
    });
  }
  return lumen.entities.Course.create(payload);
}
