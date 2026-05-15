/**
 * pages.config.js — page routing configuration
 *
 * `mainPage` sets the component shown at `/`.
 * `Layout` wraps every page (optional).
 */
import AppLayout from '@/components/Layout';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import StudentDashboard from './pages/StudentDashboard';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherCourses from './pages/TeacherCourses';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherStudents from './pages/TeacherStudents';

export const PAGES = {
  Login,
  CourseDetail,
  Courses,
  Landing,
  Onboarding,
  Profile,
  Settings,
  StudentDashboard,
  TeacherAnalytics,
  TeacherCourses,
  TeacherDashboard,
  TeacherStudents,
};

export const pagesConfig = {
  mainPage: 'Landing',
  Pages: PAGES,
  Layout: AppLayout,
};
