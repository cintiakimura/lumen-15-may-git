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
  Video,
  Brain,
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
  runtimeAppendCoachVerifiedLesson,
  runtimeAuthMe,
} from '@/lib/appRuntime';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { isMentalScenarioLesson } from '@/lib/mentalScenario';

export default function CourseModulePlayer() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  
  const [activeLesson, setActiveLesson] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [preferredModality, setPreferredModality] = useState('auto');
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

  const { data: progress = { completedLessons: [], mastery: 0, coach_verified_lessons: [] }, refetch: refetchProgress } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => runtimeStudentProgress(courseId),
    enabled: !!courseId,
    initialData: { completedLessons: [], mastery: 0, coach_verified_lessons: [] }
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
    if (activeLesson?.id && score >= 85) {
      await runtimeAppendCoachVerifiedLesson(courseId, progress, activeLesson.id);
    }
    refetchProgress();
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const verified = progress.coach_verified_lessons || [];
    const doneCoach = verified.includes(activeLesson.id);
    if (!progress.completedLessons?.includes(activeLesson.id) && !doneCoach) {
      return;
    }
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

  const coachVerified = activeLesson
    ? (progress.coach_verified_lessons || []).includes(activeLesson.id)
    : false;
  const canContinueModule =
    activeLesson &&
    (coachVerified || progress.completedLessons?.includes(activeLesson.id));

  const displayFormat =
    preferredModality === 'auto'
      ? activeLesson?.format
      : preferredModality === 'voice'
        ? 'podcast'
        : preferredModality === 'video'
          ? 'video'
          : preferredModality === 'visual'
            ? 'slides'
            : activeLesson?.format;

  const formatIcons = {
    podcast: Volume2,
    slides: FileText,
    video: Video,
    infographic: ImageIcon,
    mental_practice: Brain,
    mental_scenario: Brain,
    simulation: Brain,
  };

  const isMentalLesson = activeLesson ? isMentalScenarioLesson(activeLesson) : false;

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
    <div className="min-h-0 flex-1 bg-background pb-6 max-md:pb-safe">
      {/* Course bar: minimal — back, title, progress */}
      <header className="lumen-glass-nav sticky top-0 z-20 flex h-14 items-center gap-3 px-3 supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))] sm:gap-4 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('StudentDashboard'))}
          className="touch-target h-11 w-11 shrink-0 text-foreground hover:bg-black/[0.04] sm:h-10 sm:w-10"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5 stroke-[1.5]" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-normal leading-snug text-foreground sm:text-base">{course.title}</h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {completedCount}/{totalLessons} lessons
          </p>
        </div>
        <div className="w-[4.5rem] shrink-0 sm:w-24">
          <ProgressBar value={progressPercent} showLabel={false} size="sm" />
        </div>
      </header>

      {/* Mobile: main lesson first (reverse column); desktop: lesson rail left */}
      <div className="flex flex-col-reverse lg:flex-row lg:min-h-[calc(100dvh-var(--app-header-h)-3.5rem)]">
        <aside className="shrink-0 border-black/[0.06] bg-muted/20 backdrop-blur-sm lg:min-h-0 lg:w-72 lg:border-r lg:bg-muted/30 xl:w-80">
          <div className="p-3 sm:p-4 lg:py-6">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:mb-4 lg:text-sm lg:normal-case lg:tracking-normal">
              Lessons
            </h2>
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
                    className={cn(
                      'w-full min-h-[48px] rounded-[6px] border p-3 text-left transition-all sm:p-4',
                      !canAccess && 'cursor-not-allowed opacity-45',
                      canAccess && 'cursor-pointer',
                      isActive &&
                        'border-black/[0.06] bg-primary/12 shadow-sm backdrop-blur-sm',
                      canAccess &&
                        !isActive &&
                        'border-transparent bg-white/50 hover:border-black/[0.06] hover:bg-white/70',
                      !canAccess && 'border-transparent bg-muted/25'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]',
                          isCompleted && 'bg-primary text-primary-foreground',
                          !isCompleted && isActive && canAccess && 'bg-primary/20 text-primary',
                          !isCompleted && canAccess && !isActive &&
                            'border border-black/[0.06] bg-white/60 text-foreground',
                          !canAccess && 'bg-muted/60 text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 stroke-[1.5]" />
                        ) : canAccess ? (
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isActive && 'text-primary',
                              !isActive && 'text-foreground'
                            )}
                          >
                            {index + 1}
                          </span>
                        ) : (
                          <Lock className="h-4 w-4 stroke-[1.5]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'truncate font-medium',
                            isActive && 'text-primary',
                            !isActive && 'text-foreground'
                          )}
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

        <main className="min-w-0 flex-1 bg-background px-4 py-5 text-left md:px-10 md:py-8">
          {activeLesson ? (
            <AnimatePresence mode="wait">
              {!showChat ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mx-auto w-full max-w-[min(100%,90rem)] px-0 sm:px-1"
                >
                  {/* Lesson header — calm spacing */}
                  <div className="mb-8">
                    <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{activeLesson.duration} min</span>
                      <span className="text-border">·</span>
                      {isMentalLesson ? (
                        <>
                          <Brain className="h-4 w-4 shrink-0" />
                          <span>Mental scenario</span>
                        </>
                      ) : (
                        <span className="capitalize">{activeLesson.format}</span>
                      )}
                    </div>
                    <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {activeLesson.title}
                    </h2>
                  </div>

                  {isMentalLesson ? (
                    <div className="mb-6 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">Mental walk-through</span>
                      {' '}
                      — Coach paints a realistic scene; you answer in text or voice like you are on the job. It is mentoring, not a test.
                    </div>
                  ) : (
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                      <span className="w-full text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-auto sm:mr-2">
                        Learning style
                      </span>
                      {[
                        { id: 'auto', label: 'Auto' },
                        { id: 'voice', label: 'Voice' },
                        { id: 'video', label: 'Video' },
                        { id: 'visual', label: 'Visual' },
                      ].map((m) => (
                        <Button
                          key={m.id}
                          type="button"
                          variant={preferredModality === m.id ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-full"
                          onClick={() => setPreferredModality(m.id)}
                        >
                          {m.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {!coachVerified && !progress.completedLessons?.includes(activeLesson.id) && (
                    <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {isMentalLesson
                        ? 'Use Grok Coach and talk through the scenario until Coach is confident you are solid before you can mark this module done and move on.'
                        : 'Use Grok Coach for a light oral check — practical scenario questions, no tick-box quiz. When Coach is confident you truly understand, you can mark this module done and move on.'}
                    </p>
                  )}
                  {isMentalLesson ? (
                    <Card className="mb-8 overflow-hidden border-0">
                      <CardContent className="p-8 sm:p-10">
                        <div className="mx-auto max-w-lg text-center">
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Brain className="h-7 w-7" aria-hidden />
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-foreground">Picture the job</h3>
                          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                            Open Grok Coach when you are ready. I will drop you into a short, vivid situation — you say what you would check or do first, then we keep walking through it together.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="mb-8 overflow-hidden border-0">
                      <CardContent className="p-0">
                        {displayFormat === 'video' ? (
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
                        ) : displayFormat === 'audio' || displayFormat === 'podcast' ? (
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
                          <div className="flex aspect-[4/3] items-center justify-center bg-muted/40 p-8">
                            <div className="text-center">
                              {displayFormat === 'slides' && (
                                <FileText className="mx-auto mb-4 h-16 w-16 stroke-[1.5] text-muted-foreground/60" />
                              )}
                              {displayFormat === 'infographic' && (
                                <ImageIcon className="mx-auto mb-4 h-16 w-16 stroke-[1.5] text-muted-foreground/60" />
                              )}
                              <p className="text-muted-foreground">Interactive {displayFormat} content</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Lesson Content */}
                  <Card className="mb-8 border-0">
                    <CardContent className="p-5 sm:p-6 md:p-8">
                      <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Key points</h3>
                      <p className="text-pretty leading-relaxed text-muted-foreground">{activeLesson.content}</p>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
                    <Button
                      onClick={() => setShowChat(true)}
                      className="btn-primary min-h-touch w-full flex-1 sm:min-h-0"
                    >
                      <MessageCircle className="mr-2 h-5 w-5 shrink-0" />
                      Grok Coach
                    </Button>
                    {canContinueModule && (
                      <Button
                        variant="outline"
                        onClick={handleNextLesson}
                        className="min-h-touch w-full shrink-0 px-6 sm:min-h-0 sm:w-auto"
                      >
                        {progress.completedLessons?.includes(activeLesson.id)
                          ? 'Next lesson'
                          : 'Mark complete & continue'}
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
                  className="mx-auto flex min-h-[min(70dvh,32rem)] w-full max-w-[min(100%,90rem)] flex-col px-0 sm:px-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" onClick={() => setShowChat(false)} className="text-foreground">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Lesson
                    </Button>
                    <h3 className="font-semibold text-foreground">{activeLesson.title}</h3>
                  </div>
                  
                  <ChatBox
                    lessonId={activeLesson.id}
                    lessonContent={activeLesson.content}
                    variant={isMentalLesson ? 'mental_scenario' : 'lesson'}
                    courseTitle={course.title}
                    lessonTitle={activeLesson.title}
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
              className="w-full max-w-md rounded-[6px] border border-black/[0.06] bg-white/90 p-8 text-center shadow-glass backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[6px] border border-black/[0.06] bg-primary/10"
              >
                <Award className="h-10 w-10 stroke-[1.5] text-primary" />
              </motion.div>

              <h2 className="mb-2 text-2xl font-light text-foreground">Congratulations</h2>
              <p className="mb-6 text-muted-foreground">
                You&apos;ve completed <strong className="font-medium text-foreground">{course.title}</strong> with{' '}
                {progress.mastery}% mastery.
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
                className="w-full py-6 font-normal"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5 stroke-[1.5]" />
                Download certificate
              </Button>

              <Button
                variant="ghost"
                className="mt-3 w-full font-normal"
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