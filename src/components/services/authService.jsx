import storageService from './storageService';

export const authService = {
  // Mock login - checks email domain for role
  login(email, password) {
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const lower = email.toLowerCase();
    const isSuperAdmin =
      lower.endsWith('@lumen.admin') ||
      lower.includes('superadmin') ||
      lower === 'admin@lumen.local';
    const isTeacher = lower.endsWith('@teacher.com') || lower.endsWith('@instructor.com');

    let role = 'learner';
    if (isSuperAdmin) role = 'super_admin';
    else if (isTeacher) role = 'teacher';

    const user = {
      id: Date.now().toString(),
      email: lower,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role,
      createdAt: new Date().toISOString(),
    };

    storageService.setUser(user);
    return user;
  },

  // Check if user is logged in
  isAuthenticated() {
    return !!storageService.getUser();
  },

  // Get current user
  getCurrentUser() {
    return storageService.getUser();
  },

  isTeacher() {
    const user = storageService.getUser();
    const r = user?.role;
    return r === 'teacher' || r === 'super_admin' || r === 'instructor';
  },

  isStudent() {
    const user = storageService.getUser();
    const r = user?.role;
    return r === 'student' || r === 'learner';
  },

  // Logout
  logout() {
    storageService.clearUser();
  },

  // Check if first time user (needs onboarding)
  needsOnboarding() {
    return this.isAuthenticated() && !storageService.isOnboarded();
  },

  // Complete onboarding
  completeOnboarding(branding) {
    storageService.setBranding(branding);
    storageService.setOnboarded(true);
  }
};

export default authService;