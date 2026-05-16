import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lumen } from '@/api/lumenClient';
import { createPageUrl } from '@/utils';

/** Hero background — matches `design-system-v0/app/page.tsx` (video + overlays). */
const DESIGN_SYSTEM_HERO_VIDEO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4';

const HERO_PAGE_BG = '#F5F4F0';
const HERO_GRADIENT =
  'linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)';

const glassBtn =
  'inline-flex min-h-touch items-center justify-center rounded-[6px] border border-border/70 bg-white/55 px-4 py-2.5 text-sm font-normal text-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

const glassBtnPrimary =
  'inline-flex min-h-touch items-center justify-center rounded-[6px] border border-primary/25 bg-primary/90 px-4 py-2.5 text-sm font-normal text-primary-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export default function Landing() {
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVideoReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handlePlatformLogin = () => {
    lumen.auth.redirectToLogin();
  };

  return (
    <div className="flex min-h-screen flex-col text-foreground" style={{ backgroundColor: HERO_PAGE_BG }}>
      {/* Top bar — actions live here */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-white/60 px-4 py-3 backdrop-blur-xl sm:px-8">
        <span className="font-light text-lg tracking-wide text-foreground">Lumen</span>
        <nav className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={handlePlatformLogin} className={glassBtnPrimary}>
            Sign in (hosted)
          </button>
          <Link to={`${createPageUrl('Login')}?demo=true`} className={glassBtn}>
            Demo mode (local)
          </Link>
          <button type="button" onClick={() => (window.location.href = '#')} className={glassBtn}>
            Try for free
          </button>
        </nav>
      </header>

      {/* Hero — background from design-system-v0 (video + gradient + progressive blur) */}
      <section className="relative min-h-[88vh] overflow-hidden border-b border-black/[0.06]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={DESIGN_SYSTEM_HERO_VIDEO}
          style={{
            transform: videoReady ? 'scale(1.05)' : 'scale(0.85)',
            transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Progressive blur + light gradient rising from bottom (design-system-v0) */}
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

        <div className="relative z-20 mx-auto max-w-6xl px-4 pb-20 pt-16 text-left sm:px-8 sm:pb-24 sm:pt-24">
          <h1 className="max-w-3xl font-light text-3xl leading-snug tracking-tight text-[#111] sm:text-4xl lg:text-[2.5rem]">
            Learning made for you, and just for you
          </h1>
          <p className="mt-5 max-w-2xl font-normal text-base leading-relaxed text-black/50 sm:text-lg">
            Cutting-edge AI meets neuroscience to transform any course into a truly personalized learning experience.
          </p>
        </div>
      </section>

      {/* Feature cards — glass, 6px radius, readable contrast */}
      <section className="px-4 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Nobody learns the same way',
              body: 'Some need to talk it out. Some need to see it first. Some need to imagine it step by step.',
            },
            {
              title: 'Your brain, your choice',
              body: 'You set your rhythm. We adapt to your pace, your style, even your mood — short bursts when you are overwhelmed, deeper dives when you are in flow.',
            },
            {
              title: 'Empowering teachers',
              body: 'Upload your content — videos, PDFs, text, anything. We reshape it so it fits you and every person on your team. Real retention, real mastery, real progress.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-[6px] border border-border/70 bg-white/60 p-6 shadow-sm backdrop-blur-xl"
            >
              <h3 className="mb-3 font-light text-xl leading-snug tracking-tight text-foreground">{card.title}</h3>
              <p className="font-normal text-base leading-relaxed text-muted-foreground">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-black/[0.06] px-4 py-12 sm:px-8" style={{ backgroundColor: 'rgba(245,244,240,0.92)' }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 max-w-2xl text-left font-light text-2xl tracking-tight text-foreground lg:text-3xl">
            A method backed by more than 103 studies
          </h2>

          <div className="mx-auto max-w-2xl space-y-8 text-left">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] border border-border/60 bg-white/55 text-sm font-normal text-foreground backdrop-blur-md">
                AI
              </div>
              <div>
                <h3 className="mb-2 font-light text-lg text-foreground">You are not a number</h3>
                <p className="font-normal text-base leading-relaxed text-muted-foreground">
                  For the first time, a learning experience designed to adapt to each individual — same content,
                  unique experiences. From podcasts and videos to deep conversations, you choose what works for you.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] border border-border/60 bg-white/55 text-lg backdrop-blur-md">
                <span aria-hidden>🧠</span>
              </div>
              <div>
                <h3 className="mb-2 font-light text-lg text-foreground">You are not alone</h3>
                <p className="font-normal text-base leading-relaxed text-muted-foreground">
                  We support and adapt until you succeed — no judgement, no pressure, because knowledge is yours,
                  forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
