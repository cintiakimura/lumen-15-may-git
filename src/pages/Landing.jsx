import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Brain,
  GraduationCap,
  LayoutGrid,
  LineChart,
  Mic,
  Shield,
  Sparkles,
  Users,
  Video,
  Workflow as WorkflowIcon,
  MessageCircle,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { lumen } from '@/api/lumenClient';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

const HERO_VIDEO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4';

const HERO_GRADIENT =
  'linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)';

const ORG_ARC =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Org%20Arc%20-%20Upscaled-Sk90jShfu7nltLnhoQbaMJC1YaQKuU.png';

const WORKFLOW_STEPS = [
  {
    n: '01',
    title: 'Define',
    desc: 'Describe outcomes, audience, and constraints in plain language. Set objectives and guardrails.',
    img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/define-5aafAmGBrxZpOqJ3XLHY3n3qzC2I5K.png',
  },
  {
    n: '02',
    title: 'Compose',
    desc: 'Structure modules, modalities, and coach flows. Wire assessments, hints, and adaptive branches.',
    img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/compose-5RT5VR4f1Y3GoFmovqTKLTG4UXp3g2.png',
  },
  {
    n: '03',
    title: 'Test',
    desc: 'Run sandbox previews. Inspect learner paths, time-on-task, and mastery signals before launch.',
    img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test-zm8guZwxJHtwWsJ7XO4B0CF7GzlNK8.png',
  },
  {
    n: '04',
    title: 'Deploy',
    desc: 'Publish to your roster in one click. Progress syncs, certificates unlock, coaches stay in context.',
    img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deploy-an8fgHSLzniojkcmRyGGIFQUJF9T5J.png',
  },
];

const plex = { fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' };

function Tag({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-normal tracking-widest text-black/40">
      {children}
    </span>
  );
}

function SectionHead({ icon: Icon, tag, titleLines, aside }) {
  return (
    <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
      <div>
        {Icon && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/70">
            <Icon className="h-5 w-5 text-black/50 stroke-[1.5]" aria-hidden />
          </div>
        )}
        <div className="mt-1">
          <Tag>{tag}</Tag>
        </div>
        <h2
          className="mt-5 text-4xl font-light leading-[1.05] tracking-tight text-[#111] md:text-5xl lg:text-6xl"
          style={plex}
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>
      </div>
      {aside && <p className="max-w-xs text-sm leading-relaxed text-black/45">{aside}</p>}
    </div>
  );
}

function BentoCard({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}
      className={`group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white transition-colors duration-300 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
        el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)',
        }}
      />
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const [videoReady, setVideoReady] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVideoReady(true));
    const t2 = setTimeout(() => setHeroReady(true), 180);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(t2);
    };
  }, []);

  const handlePlatformLogin = () => {
    lumen.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans text-[#111] antialiased">
      {/* Sticky nav — Agentic-style: links + primary CTA */}
      <header className="lumen-glass-nav fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <span className="text-lg font-light tracking-wide" style={plex}>
          Lumen
        </span>
        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-6 text-[13px] font-normal tracking-wide text-black/50 md:flex">
          <a href="#platform" className="transition-colors hover:text-black">
            Platform
          </a>
          <a href="#modes" className="transition-colors hover:text-black">
            Modes
          </a>
          <a href="#workflow" className="transition-colors hover:text-black">
            Workflow
          </a>
          <a href="#integrations" className="transition-colors hover:text-black">
            Integrations
          </a>
          <a href="#security" className="transition-colors hover:text-black">
            Security
          </a>
          <a href="#live" className="transition-colors hover:text-black">
            Live
          </a>
          <a href="#pricing" className="transition-colors hover:text-black">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePlatformLogin}
            className="hidden border-0 bg-transparent text-[13px] font-normal text-black/50 transition-colors hover:text-black sm:inline"
          >
            Sign in
          </button>
          <Button asChild className="rounded-md px-4 text-[12px] font-medium tracking-widest sm:px-6">
            <Link to={`${createPageUrl('Login')}?demo=true`}>START LEARNING</Link>
          </Button>
        </div>
      </header>

      {/* Hero — full-bleed video + gradient stack + bottom-left headline (Agentic) */}
      <section className="relative h-[100dvh] min-h-[32rem] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          style={{
            transform: videoReady ? 'scale(1.05)' : 'scale(0.85)',
            transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{ height: '65%', background: HERO_GRADIENT }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: '20%',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: '38%',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: '55%',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />

        <div className="h-20 shrink-0" aria-hidden />

        <div className="absolute inset-x-0 bottom-0 z-30 flex max-w-4xl flex-col px-6 pb-10 md:px-12 md:pb-14">
          <h1
            className="mb-8 text-5xl font-light leading-[1.0] tracking-tight text-[#111] sm:text-6xl sm:mb-10 md:text-7xl lg:text-8xl"
            style={{
              ...plex,
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? 'blur(0px)' : 'blur(24px)',
              transform: heroReady ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            Design &amp;
            <br />
            personalize every
            <br />
            learner journey
            <br />
            at any scale.
          </h1>
          <div className="flex flex-wrap gap-8 sm:gap-12">
            {[
              { value: '2.4M+', label: 'Lessons' },
              { value: '99.9%', label: 'Uptime' },
              { value: '120+', label: 'Countries' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? 'blur(0px)' : 'blur(16px)',
                  transform: heroReady ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms`,
                }}
              >
                <div
                  className="text-3xl font-light tracking-tight text-[#111] sm:text-4xl"
                  style={plex}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-1 text-xs uppercase tracking-widest text-black/40"
                  style={plex}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM — bento */}
      <section id="platform" className="px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            icon={LayoutGrid}
            tag="PLATFORM"
            titleLines={['Everything you need', 'to ship learning.']}
          />
          <div className="grid auto-rows-auto grid-cols-12 gap-3">
            <BentoCard className="col-span-12 flex min-h-[220px] flex-col justify-between p-8 md:min-h-[260px]" delay={0}>
              <div
                className="absolute inset-0 bg-gradient-to-br from-white via-[#f0efe9] to-[#e8e6df]"
                aria-hidden
              />
              <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
                aria-hidden
              />
              <div className="relative z-10">
                <div
                  className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/60"
                  style={{ backdropFilter: 'blur(8px)' }}
                >
                  <Sparkles className="h-[18px] w-[18px] text-black/55 stroke-[1.5]" />
                </div>
                <h3 className="mb-3 text-xl font-light">Adaptive learning paths</h3>
                <p className="max-w-md text-sm leading-relaxed text-black/45">
                  Map modalities to learners—video, voice, text, and coach chat—without boilerplate. Ship structured
                  courses in minutes, not weeks.
                </p>
              </div>
            </BentoCard>

            {[
              {
                icon: Activity,
                title: 'Real-time progress',
                body: 'Trace completion, mastery, and coach verification. Replay the path a learner took through any module.',
              },
              {
                icon: Brain,
                title: 'Memory & context',
                body: 'Persistent context across sessions so the coach picks up where the learner left off—no cold starts.',
              },
              {
                icon: Shield,
                title: 'Guardrails & roles',
                body: 'Teachers, learners, and admins each see the right surfaces. Fine-grained access per course and cohort.',
              },
            ].map((item, idx) => (
              <BentoCard key={item.title} className="col-span-12 p-8 md:col-span-4 md:min-h-[200px]" delay={120 + idx * 40}>
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10">
                  <item.icon className="h-[18px] w-[18px] text-black/55 stroke-[1.5]" />
                </div>
                <h3 className="mb-2 text-lg font-light">{item.title}</h3>
                <p className="text-sm leading-relaxed text-black/45">{item.body}</p>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* MODES — Agentic “agent types” grid */}
      <section id="modes" className="border-t border-black/[0.06] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            icon={Users}
            tag="LEARNING MODES"
            titleLines={['Plug-and-play formats', 'ready to deploy.']}
            aside="Start with proven templates or compose your own. Every path is versioned, measurable, and coach-aware."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                label: 'VISUAL',
                title: 'Video & rich media',
                body: 'Primary video, slides, and infographics with pacing hints and checkpoints.',
                stat1: '840K',
                s1l: 'views',
                stat2: '4.2★',
                s2l: 'avg rating',
                icon: Video,
              },
              {
                label: 'VOICE',
                title: 'Podcast & narration',
                body: 'Hands-busy learners stay in flow with audio-first modules and transcripts.',
                stat1: '320K',
                s1l: 'listening hrs',
                stat2: '2.1×',
                s2l: 'retention lift',
                icon: Mic,
              },
              {
                label: 'COACH',
                title: 'AI mentor chat',
                body: 'Grounded dialogue on lesson content with mastery scoring and human escalation.',
                stat1: '1.1M',
                s1l: 'sessions',
                stat2: '92%',
                s2l: 'satisfaction',
                icon: MessageCircle,
              },
              {
                label: 'ANALYTICS',
                title: 'Mastery & cohorts',
                body: 'Slice progress by team, site, or program. Spot gaps before they become drop-offs.',
                stat1: '560K',
                s1l: 'reports',
                stat2: '12×',
                s2l: 'faster insight',
                icon: LineChart,
              },
            ].map((card) => (
              <BentoCard key={card.label} className="p-8" delay={80}>
                <Tag>{card.label}</Tag>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-light">{card.title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/45">{card.body}</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/80">
                    <card.icon className="h-5 w-5 text-black/50 stroke-[1.5]" />
                  </div>
                </div>
                <div className="mt-8 flex gap-10 border-t border-black/[0.06] pt-6">
                  <div>
                    <div className="text-2xl font-light tabular-nums text-[#111]" style={plex}>
                      {card.stat1}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-widest text-black/35">{card.s1l}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-light tabular-nums text-[#111]" style={plex}>
                      {card.stat2}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-widest text-black/35">{card.s2l}</div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="border-t border-black/[0.06] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            icon={WorkflowIcon}
            tag="WORKFLOW"
            titleLines={['From idea to live course', 'in four steps.']}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {WORKFLOW_STEPS.map((step, idx) => (
              <BentoCard key={step.n} className="relative flex min-h-[300px] flex-col overflow-hidden md:min-h-[320px]" delay={idx * 80}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-56">
                  <img
                    src={step.img}
                    alt=""
                    className="h-full w-full object-cover object-top"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 0%, black 30%, transparent 80%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 30%, transparent 80%)',
                    }}
                  />
                </div>
                <div className="relative z-10 p-7">
                  <span className="block text-[11px] tracking-widest text-black/25" style={plex}>
                    {step.n}
                  </span>
                </div>
                <div className="relative z-10 mt-auto px-7 pb-7 pt-12">
                  <h3 className="mb-3 text-2xl font-light">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-black/45">{step.desc}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section id="integrations" className="border-t border-black/[0.06] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            icon={GraduationCap}
            tag="INTEGRATIONS"
            titleLines={['Connect your stack.', 'Control every cohort.']}
            aside="SCORM, LTI, HRIS, and SSO—plus a typed SDK to embed Lumen into your own product surfaces."
          />
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] md:relative">
            <div className="relative h-[280px] w-full shrink-0 md:h-[480px]">
              <img
                src={ORG_ARC}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
                aria-hidden
              />
            </div>
            <div className="flex flex-col gap-3 p-4 md:absolute md:bottom-4 md:right-4 md:w-72 md:p-0">
              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  background: 'rgba(255,255,255,0.60)',
                }}
              >
                <Tag>SDK</Tag>
                <h3 className="mt-3 text-lg font-light">Embed the player</h3>
                <p className="mb-4 text-xs leading-relaxed text-black/45">
                  Mount modules, progress, and coach chat with a few lines. TypeScript-first.
                </p>
                <div className="rounded-lg border border-black/[0.07] bg-black/[0.05] p-3 font-mono text-[11px] leading-relaxed text-black/50">
                  <span className="text-black/25">// embed</span>
                  <br />
                  <span className="text-blue-600/70">lumen</span>.<span className="text-amber-700/70">mount</span>
                  {'({ '}
                  <br />
                  {'  '}<span className="text-amber-700/70">courseId</span>: <span className="text-green-700/70">&apos;c_01&apos;</span>,
                  <br />
                  {'  '}<span className="text-amber-700/70">token</span>: <span className="text-green-700/70">&apos;…&apos;</span>
                  <br />
                  {'})'}
                </div>
              </div>
              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  background: 'rgba(255,255,255,0.60)',
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500/80" />
                  <span className="text-xs tracking-widest text-black/40">LIVE API</span>
                </div>
                <p className="text-sm text-black/45">
                  REST + WebSocket for completions, certificates, and streaming coach tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="border-t border-black/[0.06] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <SectionHead icon={Shield} tag="SECURITY" titleLines={['Enterprise-grade', 'from day one.']} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-black/45">
                Every launch is logged, every completion is traceable. Built for teams that need auditability without
                slowing instructors down.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'SOC 2 Type II', desc: 'Independently audited controls for production deployments.' },
                  { label: 'Full audit trail', desc: 'Exports for HR and compliance with immutable completion records.' },
                  { label: 'Real-time observability', desc: 'Monitor cohort health, coach load, and content drift.' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-black/10" />
                    <div>
                      <h3 className="mb-1 text-sm font-light">{item.label}</h3>
                      <p className="text-xs text-black/35">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-4">
                {['SOC 2', 'GDPR', 'FERPA aware', 'ISO 27001'].map((b) => (
                  <span
                    key={b}
                    className="inline-flex w-max items-center rounded-full border border-black/[0.08] bg-white/80 px-3 py-1.5 text-[11px] tracking-wide text-black/45"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <BentoCard className="p-6" delay={0}>
              <div className="mb-3 text-[11px] tracking-widest text-black/35">LIVE AUDIT TRAIL</div>
              <div className="space-y-2 font-mono text-[11px] text-black/45">
                {[
                  '12:34:21  lesson_completed',
                  '12:34:18  mastery_scored',
                  '12:34:15  coach_message',
                  '12:34:12  progress_synced',
                  '12:34:09  certificate_eligible',
                ].map((row) => (
                  <div key={row} className="rounded-md border border-black/[0.06] bg-black/[0.03] px-3 py-2">
                    {row}
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* LIVE */}
      <section id="live" className="border-t border-black/[0.06] bg-black/[0.02] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            icon={Activity}
            tag="LIVE RIGHT NOW"
            titleLines={['Learners on-path', '24 / 7, globally.']}
          />
          <p className="-mt-4 mb-8 max-w-xl text-sm text-black/45">
            At any moment, thousands of modules are in flight—coach-assisted, modality-aware, and measurable.
          </p>
          <div className="mb-4 text-sm font-light text-black/50">
            <span className="tabular-nums">2,847</span> active sessions
          </div>
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <div className="grid grid-cols-12 gap-2 border-b border-black/[0.06] px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-black/40 md:px-6">
              <span className="col-span-3 md:col-span-2">Learner</span>
              <span className="col-span-3 md:col-span-2">Course</span>
              <span className="col-span-4 md:col-span-5">Activity</span>
              <span className="col-span-1">Region</span>
              <span className="col-span-1 text-right md:col-span-2">Status</span>
            </div>
            {[
              ['alex-7f2a', 'Welding 101', 'Practice quiz — unit 4', 'us-east', 'running'],
              ['sam-3b1c', 'Sales playbooks', 'Voice recap playback', 'eu-west', 'running'],
              ['jordan-2c8f', 'Safety basics', 'Downloading certificate PDF', 'us-west', 'queued'],
              ['taylor-5a3d', 'Onboarding', 'Coach chat — scenario 2', 'eu-central', 'running'],
              ['riley-8d1a', 'Leadership', 'Video module — chapter 3', 'ap-south', 'running'],
              ['morgan-9d4e', 'Compliance', 'Mastery review 85%+', 'us-east', 'complete'],
            ].map((row) => (
              <div
                key={row[0]}
                className="grid grid-cols-12 items-center gap-2 border-b border-black/[0.04] px-4 py-3 text-[13px] last:border-0 md:px-6"
              >
                <span className="col-span-3 truncate font-mono text-xs text-black/60 md:col-span-2">{row[0]}</span>
                <span className="col-span-3 truncate text-black/50 md:col-span-2">{row[1]}</span>
                <span className="col-span-4 truncate text-black/70 md:col-span-5">{row[2]}</span>
                <span className="col-span-1 truncate text-xs text-black/40">{row[3]}</span>
                <span className="col-span-1 text-right text-xs capitalize text-black/55 md:col-span-2">{row[4]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-black/[0.06] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <SectionHead icon={BookOpen} tag="PRICING" titleLines={['Pay as your', 'campus grows.']} />
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                name: 'Sandbox',
                price: 'Free',
                sub: 'Start experimenting',
                feats: ['3 courses', '500 learners / mo', 'Community support', 'Basic analytics'],
                cta: 'GET STARTED',
                href: `${createPageUrl('Login')}?demo=true`,
                primary: false,
              },
              {
                name: 'Campus',
                price: '$49/mo',
                sub: 'For teams shipping fast',
                feats: [
                  'Unlimited courses',
                  '10K learners / mo',
                  'Priority support',
                  'Coach traces + exports',
                  'REST API',
                ],
                cta: 'GET STARTED',
                href: `${createPageUrl('Login')}?demo=true`,
                primary: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                sub: 'For global programs',
                feats: ['Unlimited learners', 'Dedicated infra', 'SLA', 'Custom contracts', 'HIPAA / SOC path'],
                cta: 'CONTACT SALES',
                href: '#',
                primary: false,
              },
            ].map((tier) => (
              <BentoCard
                key={tier.name}
                className={`flex flex-col p-8 ${tier.primary ? 'ring-1 ring-black/10 md:scale-[1.02]' : ''}`}
                delay={60}
              >
                <h3 className="text-lg font-light">{tier.name}</h3>
                <div className="mt-2 text-3xl font-light" style={plex}>
                  {tier.price}
                </div>
                <p className="mt-1 text-sm text-black/45">{tier.sub}</p>
                <ul className="my-8 flex-1 space-y-2 text-sm text-black/50">
                  {tier.feats.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-black/25">–</span> {f}
                    </li>
                  ))}
                </ul>
                {tier.primary ? (
                  <Button asChild className="w-full rounded-md tracking-widest">
                    <Link to={tier.href}>{tier.cta}</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full rounded-md border-black/15 bg-transparent tracking-widest">
                    <Link to={tier.href}>{tier.cta}</Link>
                  </Button>
                )}
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-black/[0.06] px-6 py-20 md:px-12 md:py-28 lg:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-light leading-[1.05] tracking-tight text-[#111] md:text-5xl" style={plex}>
            Start building your
            <br />
            learning workforce.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-black/45">
            Join teams deploying personalized training that runs around the clock—across every timezone.
          </p>
          <Button asChild size="lg" className="mt-10 rounded-md px-10 tracking-widest">
            <Link to={`${createPageUrl('Login')}?demo=true`}>JOIN</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-black/[0.06] px-6 py-8 text-center text-[11px] text-black/35">
        <Link to={createPageUrl('Login')} className="underline-offset-4 hover:text-black hover:underline">
          Instructor sign in
        </Link>
        <span className="mx-3">·</span>
        <span>© {new Date().getFullYear()} Lumen</span>
      </footer>
    </div>
  );
}
