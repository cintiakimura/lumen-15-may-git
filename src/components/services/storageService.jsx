// Local storage service for mock data
const KEYS = {
  USER: 'lumen_user',
  BRANDING: 'lumen_branding',
  COURSES: 'lumen_courses',
  PROGRESS: 'lumen_progress',
  ONBOARDED: 'lumen_onboarded',
  COURSE_ASSIGNMENTS: 'lumen_course_assignments',
};

export const storageService = {
  // User management
  getUser() {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  setUser(user) {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem(KEYS.USER);
  },

  // Branding
  getBranding() {
    const data = localStorage.getItem(KEYS.BRANDING);
    return data ? JSON.parse(data) : {
      primaryColor: '#3B82F6',
      font: 'Inter',
      logo: null
    };
  },

  setBranding(branding) {
    localStorage.setItem(KEYS.BRANDING, JSON.stringify(branding));
  },

  // Onboarding status
  isOnboarded() {
    return localStorage.getItem(KEYS.ONBOARDED) === 'true';
  },

  setOnboarded(status) {
    localStorage.setItem(KEYS.ONBOARDED, status.toString());
  },

  // Mock courses
  getCourses() {
    const data = localStorage.getItem(KEYS.COURSES);
    if (data) return JSON.parse(data);
    
    // Default mock courses
    const defaultCourses = [
      {
        id: '1',
        title: 'Brake Repair Fundamentals',
        description: 'Learn the basics of automotive brake systems, inspection, and repair.',
        category: 'auto_repair',
        thumbnail: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
        lessons: [
          { id: 'l1', title: 'Understanding Brake Systems', format: 'podcast', content: 'Introduction to hydraulic brake systems, components, and how they work together.', duration: 5 },
          { id: 'l2', title: 'Brake Pad Inspection', format: 'slides', content: 'Visual inspection techniques, measuring pad thickness, identifying wear patterns.', duration: 5 },
          { id: 'l3', title: 'Rotor Assessment', format: 'video', content: 'How to check rotors for warping, scoring, and minimum thickness specs.', duration: 5 },
          { id: 'l4', title: 'Brake Fluid Basics', format: 'infographic', content: 'Types of brake fluid, checking levels, bleeding procedures.', duration: 5 },
          { id: 'l5', title: 'Hands-On: Pad Replacement', format: 'video', content: 'Step-by-step guide to replacing brake pads safely.', duration: 5 },
          {
            id: 'l6',
            title: 'Mental scenario: Smoke at startup',
            format: 'mental_practice',
            content:
              'Ground topics for scenarios: thick black exhaust smoke right after start, customer says it just began; multimeter on battery reads very low with no crank; roadside crank-no-start with strong fuel smell. Coach will pick one beat at a time and ask what you would check or do first.',
            duration: 8,
          },
        ],
        is_published: true
      },
      {
        id: '2',
        title: 'Welding Safety & Basics',
        description: 'Essential safety practices and fundamental welding techniques.',
        category: 'welding',
        thumbnail: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
        lessons: [
          { id: 'l1', title: 'PPE & Safety Equipment', format: 'slides', content: 'Required protective equipment, proper usage, and safety protocols.', duration: 5 },
          { id: 'l2', title: 'Understanding MIG Welding', format: 'podcast', content: 'MIG welding basics, when to use it, equipment overview.', duration: 5 },
          { id: 'l3', title: 'Setting Up Your Station', format: 'video', content: 'Proper workspace setup, ventilation, and equipment preparation.', duration: 5 }
        ],
        is_published: true
      },
      {
        id: '3',
        title: 'Sales Communication Mastery',
        description: 'Develop effective communication skills for sales success.',
        category: 'sales',
        thumbnail: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400',
        lessons: [
          { id: 'l1', title: 'Active Listening', format: 'podcast', content: 'The art of listening to understand customer needs and pain points.', duration: 5 },
          { id: 'l2', title: 'Building Rapport', format: 'slides', content: 'Techniques for creating genuine connections with prospects.', duration: 5 }
        ],
        is_published: true
      }
    ];
    
    localStorage.setItem(KEYS.COURSES, JSON.stringify(defaultCourses));
    return defaultCourses;
  },

  setCourses(courses) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  },

  addCourse(course) {
    const courses = this.getCourses();
    const id = course.id || `${Date.now()}`;
    const row = { ...course, id };
    courses.push(row);
    this.setCourses(courses);
    return row;
  },

  // Progress tracking
  getProgress(studentId) {
    const data = localStorage.getItem(KEYS.PROGRESS);
    const allProgress = data ? JSON.parse(data) : {};
    return allProgress[studentId] || {};
  },

  setProgress(studentId, courseId, progress) {
    const data = localStorage.getItem(KEYS.PROGRESS);
    const allProgress = data ? JSON.parse(data) : {};
    
    if (!allProgress[studentId]) {
      allProgress[studentId] = {};
    }
    
    allProgress[studentId][courseId] = progress;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(allProgress));
  },

  getAllProgress() {
    const data = localStorage.getItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  },

  getCourseAssignmentMap() {
    const data = localStorage.getItem(KEYS.COURSE_ASSIGNMENTS);
    return data ? JSON.parse(data) : {};
  },

  setCourseAssignmentMap(map) {
    localStorage.setItem(KEYS.COURSE_ASSIGNMENTS, JSON.stringify(map));
  },

  /** Replace assigned student ids for a course (empty array = all learners may see it). */
  setCourseStudents(courseId, studentIds) {
    const map = this.getCourseAssignmentMap();
    map[courseId] = studentIds;
    this.setCourseAssignmentMap(map);
  },

  /** Course ids this learner may access (published + assignment rules). */
  getAssignedCourseIdsForStudent(studentId) {
    const courses = this.getCourses().filter((c) => c.is_published);
    const map = this.getCourseAssignmentMap();
    return courses
      .filter((c) => {
        const ids = map[c.id];
        if (!ids || ids.length === 0) return true;
        return ids.includes(studentId);
      })
      .map((c) => c.id);
  },

  // Mock students for teacher view
  getMockStudents() {
    return [
      { id: 's1', name: 'Alex Johnson', email: 'alex@student.com', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 's2', name: 'Maria Garcia', email: 'maria@student.com', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: 's3', name: 'James Wilson', email: 'james@student.com', avatar: 'https://i.pravatar.cc/150?img=3' },
      { id: 's4', name: 'Sarah Chen', email: 'sarah@student.com', avatar: 'https://i.pravatar.cc/150?img=9' },
      { id: 's5', name: 'Michael Brown', email: 'michael@student.com', avatar: 'https://i.pravatar.cc/150?img=8' }
    ];
  },

  getMockStudentProgress() {
    return [
      { studentId: 's1', courseId: '1', completedLessons: ['l1', 'l2', 'l3'], mastery: 92 },
      { studentId: 's2', courseId: '1', completedLessons: ['l1', 'l2'], mastery: 78 },
      { studentId: 's3', courseId: '1', completedLessons: ['l1', 'l2', 'l3', 'l4', 'l5'], mastery: 95 },
      { studentId: 's4', courseId: '2', completedLessons: ['l1'], mastery: 65 },
      { studentId: 's5', courseId: '1', completedLessons: ['l1', 'l2', 'l3', 'l4'], mastery: 88 }
    ];
  }
};

export default storageService;