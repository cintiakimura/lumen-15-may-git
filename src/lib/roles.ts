/**
 * Canonical roles & permissions. API / demo may send legacy aliases — normalize first.
 */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  TEACHER: "teacher",
  LEARNER: "learner",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

/** Permissions for fine-grained checks (extend as the app grows). */
export const PERMISSIONS = {
  MANAGE_PLATFORM: "manage_platform",
  MANAGE_COURSES: "manage_courses",
  ASSIGN_STUDENTS: "assign_students",
  VIEW_ANALYTICS: "view_analytics",
  VIEW_ALL_PROGRESS: "view_all_progress",
  LEARN: "learn",
  VIEW_CERTIFICATES: "view_certificates",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.MANAGE_PLATFORM,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.ASSIGN_STUDENTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
    PERMISSIONS.LEARN,
    PERMISSIONS.VIEW_CERTIFICATES,
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.ASSIGN_STUDENTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ALL_PROGRESS,
  ],
  [ROLES.LEARNER]: [PERMISSIONS.LEARN, PERMISSIONS.VIEW_CERTIFICATES],
};

/** Pages that require specific roles (empty = any authenticated user). Public pages omitted. */
export const PAGE_MIN_ROLES: Record<string, AppRole[]> = {
  Landing: [],
  Login: [],
  Onboarding: [],
  Profile: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.LEARNER],
  Settings: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.LEARNER],
  TeacherDashboard: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
  TeacherCourses: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
  TeacherStudents: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
  TeacherAnalytics: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
  CourseBuilder: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
  StudentDashboard: [ROLES.SUPER_ADMIN, ROLES.LEARNER],
  Courses: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.LEARNER],
  CourseDetail: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.LEARNER],
  CourseModule: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.LEARNER],
  Certificate: [ROLES.SUPER_ADMIN, ROLES.LEARNER],
};

export function isPublicPage(pageKey: string): boolean {
  return pageKey === "Landing" || pageKey === "Login";
}

export function normalizeRole(raw: string | undefined | null): AppRole {
  const r = (raw || "").toLowerCase().trim();
  if (r === "super_admin" || r === "superadmin" || r === "admin") return ROLES.SUPER_ADMIN;
  if (r === "teacher" || r === "instructor") return ROLES.TEACHER;
  if (r === "learner" || r === "student") return ROLES.LEARNER;
  return ROLES.LEARNER;
}

export function roleMeetsMinimum(userRole: AppRole, allowed: AppRole[]): boolean {
  if (!allowed.length) return true;
  if (allowed.includes(userRole)) return true;
  if (userRole === ROLES.SUPER_ADMIN) return true;
  return false;
}

export function can(userRole: AppRole | null | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  const list = ROLE_PERMISSIONS[userRole];
  return list?.includes(permission) ?? false;
}

export function getDefaultHomeForRole(role: AppRole): string {
  if (role === ROLES.SUPER_ADMIN || role === ROLES.TEACHER) return "TeacherDashboard";
  return "StudentDashboard";
}
