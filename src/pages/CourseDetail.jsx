import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  CheckCircle, 
  Lock,
  Clock,
  BookOpen,
  Award,
  Download,
  MessageCircle,
  Volume2,
  Image as ImageIcon,
  FileText,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from '@/components/ui/ProgressBar';
import ChatBox from '@/components/ChatBox';
import storageService from '@/components/services/storageService';
import certificateService from '@/components/services/certificateService';
import {
  runtimeAuthIsAuthenticated,
  runtimeRedirectToLogin,
  runtimeListCoursesForLookup,
  runtimeStudentProgress,
  runtimeSaveLessonProgress,
  runtimeSaveMasteryProgress,
  runtimeAuthMe,
} from '@/lib/appRuntime';
import { useQuery } from '@tanstack/react-query';

export default function CourseDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  
  const [activeLesson, setActiveLesson] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  
  const branding = storageService.getBranding();

  useEffect(() => {
    runtimeAuthIsAuthenticated().then((isAuth) => {
      if (!isAuth) {
        runtimeRedirectToLogin();
      }
    });
  }, [navigate]);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await runtimeListCoursesForLookup();
      return courses.find(c => c.id === courseId);
    },
    enabled: !!courseId
  });

  const { data: progress = { completedLessons: [], mastery: 0 }, refetch: refetchProgress } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => runtimeStudentProgress(courseId),
    enabled: !!courseId,
    initialData: { completedLessons: [], mastery: 0 }
  });

  useEffect(() => {
    if (course?.lessons) {
      const firstIncomplete = course.lessons.findIndex(
        l => !progress.completedLessons?.includes(l.id)
      );
      if (firstIncomplete >= 0) {
        setActiveLesson(course.lessons[firstIncomplete]);
      }
    }
  }, [course, progress]);

  const handleLessonClick = (lesson, index) => {
    // Can only access completed lessons or the next one
    const canAccess = progress.completedLessons?.includes(lesson.id) || 
      index === (progress.completedLessons?.length || 0);
    
    if (canAccess) {
      setActiveLesson(lesson);
      setShowChat(false);
    }
  };

  const handleLessonComplete = async (lessonId) => {
    await runtimeSaveLessonProgress(courseId, progress, course, lessonId);
    const done =
      [...(progress.completedLessons || []), lessonId].length === course?.lessons?.length;
    if (done) {
      setShowCertificate(true);
    }
    refetchProgress();
  };

  const handleMasteryUpdate = async (score) => {
    await runtimeSaveMasteryProgress(courseId, progress, score);
    refetchProgress();
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    
    // Mark current as complete if not already
    if (!progress.completedLessons?.includes(activeLesson.id)) {
      handleLessonComplete(activeLesson.id);
    }
    
    // Find next lesson
    const currentIndex = course.lessons?.findIndex(l => l.id === activeLesson.id);
    if (currentIndex < course.lessons.length - 1) {
      setActiveLesson(course.lessons[currentIndex + 1]);
      setShowChat(false);
    }
  };

  const formatIcons = {
    podcast: Volume2,
    slides: FileText,
    video: Video,
    infographic: ImageIcon
  };

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const completedCount = progress.completedLessons?.length || 0;
  const totalLessons = course.lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-64">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('StudentDashboard'))}
          className="text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold text-foreground">{course.title}</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{totalLessons} lessons
          </p>
        </div>
        <div className="w-20">
          <ProgressBar value={progressPercent} showLabel={false} size="sm" />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Lesson List - Sidebar on desktop */}
        <aside className="border-border/60 bg-muted/30 backdrop-blur-sm lg:min-h-screen lg:w-80 lg:border-r">
          <div className="p-4">
            <h2 className="mb-4 font-semibold text-foreground">Course Content</h2>
            <div className="space-y-2">
              {course.lessons?.map((lesson, index) => {
                const isCompleted = progress.completedLessons?.includes(lesson.id);
                const isActive = activeLesson?.id === lesson.id;
                const canAccess = isCompleted || index === (progress.completedLessons?.length || 0);
                const FormatIcon = formatIcons[lesson.format] || BookOpen;

                return (
                  <motion.button
                    key={lesson.id}
                    whileTap={canAccess ? { scale: 0.98 } : {}}
                    onClick={() => handleLessonClick(lesson, index)}
                    disabled={!canAccess}
                    className="w-full text-left p-4 rounded-xl transition-all"
                    style={{
                      background: isActive ? 'hsl(var(--primary))' : 'hsl(var(--surface))',
                      border: isActive ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                      opacity: canAccess ? 1 : 0.5
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: isCompleted ? 'hsl(var(--primary))' : isActive ? 'hsl(var(--primary))' : 'hsl(var(--surface))'
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-primary-foreground" />
                        ) : canAccess ? (
                          <span className="text-sm font-semibold text-primary-foreground">{index + 1}</span>
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p 
                          className="font-medium truncate"
                          style={{ color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))' }}
                        >
                          {lesson.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <FormatIcon className="w-3 h-3" />
                          <span className="capitalize">{lesson.format}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration} min</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-background p-4 lg:p-8">
          {activeLesson ? (
            <AnimatePresence mode="wait">
              {!showChat ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-3xl mx-auto"
                >
                  {/* Lesson Header */}
                  <div className="mb-6">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{activeLesson.duration} minutes</span>
                      <span>•</span>
                      <span className="capitalize">{activeLesson.format}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{activeLesson.title}</h2>
                  </div>

                  {/* Content Placeholder based on format */}
                  <Card className="glass-panel mb-6 overflow-hidden border-0 shadow-glass">
                    <CardContent className="p-0">
                      {activeLesson.format === 'video' ? (
                       <div className="aspect-video bg-slate-900">
                         <video 
                           controls 
                           className="w-full h-full"
                           poster={course.thumbnail}
                         >
                           <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                           Your browser does not support the video tag.
                         </video>
                       </div>
                      ) : activeLesson.format === 'audio' || activeLesson.format === 'podcast' ? (
                       <div className="bg-slate-900 p-8">
                         <div className="max-w-md mx-auto">
                           <img 
                             src={course.thumbnail}
                             alt=""
                             className="w-32 h-32 rounded-xl mx-auto mb-6 shadow-2xl"
                           />
                           <audio 
                             controls 
                             className="w-full"
                           >
                             <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
                             Your browser does not support the audio element.
                           </audio>
                         </div>
                       </div>
                      ) : (
                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center p-8">
                          <div className="text-center">
                            {activeLesson.format === 'slides' && <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />}
                            {activeLesson.format === 'infographic' && <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />}
                            <p className="text-slate-500">Interactive {activeLesson.format} content</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Lesson Content */}
                  <Card className="glass-panel mb-6 border-0 shadow-glass">
                    <CardContent className="p-6">
                      <h3 className="mb-3 font-semibold text-foreground">Key Points</h3>
                      <p className="leading-relaxed text-muted-foreground">{activeLesson.content}</p>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowChat(true)}
                      className="btn-primary flex-1"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Practice with AI Tutor
                    </Button>
                    {progress.completedLessons?.includes(activeLesson.id) && (
                      <Button
                        variant="outline"
                        onClick={handleNextLesson}
                        className="py-6"
                      >
                        Next Lesson
                      </Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-3xl mx-auto h-[calc(100vh-200px)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" onClick={() => setShowChat(false)} className="text-foreground">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Lesson
                    </Button>
                    <h3 className="font-semibold text-foreground">{activeLesson.title}</h3>
                  </div>
                  
                  <ChatBox
                    lessonContent={activeLesson.content}
                    onMasteryUpdate={handleMasteryUpdate}
                    onComplete={handleNextLesson}
                    className="h-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-muted-foreground">Select a lesson to begin</h3>
            </div>
          )}
        </main>
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Award className="w-12 h-12 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-2">🎉 Congratulations!</h2>
              <p className="text-slate-600 mb-6">
                You've completed <strong>{course.title}</strong> with {progress.mastery}% mastery!
              </p>

              <Button
                onClick={async () => {
                  const user = await runtimeAuthMe();
                  certificateService.generateCertificate(
                    course.title,
                    user?.full_name || 'Student',
                    progress.mastery_score || progress.mastery || 85
                  );
                }}
                className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Certificate
              </Button>

              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => {
                  setShowCertificate(false);
                  navigate(createPageUrl('StudentDashboard'));
                }}
              >
                Back to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}