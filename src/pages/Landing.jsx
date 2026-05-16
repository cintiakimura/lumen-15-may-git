import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles } from 'lucide-react';
import { lumen } from '@/api/lumenClient';
import { createPageUrl } from '@/utils';

/** Hero video — same asset as `design-system-v0/app/page.tsx`. */
const DESIGN_SYSTEM_HERO_VIDEO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4';

const headerLinkClass =
  'border-0 bg-transparent p-0 text-left text-sm font-normal text-foreground/75 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="lumen-glass-nav sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 rounded-b-[6px] px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:px-8">
        <span className="font-light text-lg tracking-wide text-foreground">Lumen</span>
        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 sm:gap-x-8">
          <button type="button" onClick={handlePlatformLogin} className={headerLinkClass}>
            Sign in (hosted)
          </button>
          <Link to={`${createPageUrl('Login')}?demo=true`} className={headerLinkClass}>
            Demo mode (local)
          </Link>
          <button type="button" onClick={() => (window.location.href = '#')} className={headerLinkClass}>
            Try for free
          </button>
        </nav>
      </header>

      {/* Hero — text left, video right (stacked on small screens: copy then media) */}
      <section className="relative border-b border-black/[0.06] bg-background">
        <div className="mx-auto grid max-w-6xl min-h-[min(88vh,52rem)] items-center gap-10 px-4 py-14 sm:gap-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div className="flex flex-col justify-center text-left">
            <h1 className="max-w-xl font-light text-3xl leading-snug tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]">
              Learning made for you, and just for you
            </h1>
            <p className="mt-5 max-w-lg font-normal text-base leading-relaxed text-muted-foreground sm:text-lg">
              Cutting-edge AI meets neuroscience to transform any course into a truly personalized learning experience.
            </p>
          </div>

          <div>
            <div className="relative overflow-hidden rounded-[6px] border border-black/[0.06] bg-muted/30 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)]">
              <div className="aspect-video w-full">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  src={DESIGN_SYSTEM_HERO_VIDEO}
                  style={{
                    transform: videoReady ? 'scale(1.03)' : 'scale(0.96)',
                    transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          </div>
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

      <section className="border-t border-black/[0.06] bg-muted/40 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 max-w-2xl text-left font-light text-2xl tracking-tight text-foreground lg:text-3xl">
            A method backed by more than 103 studies
          </h2>

          <div className="mx-auto max-w-2xl space-y-8 text-left">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] border border-border/60 bg-white/55 backdrop-blur-md">
                <Sparkles className="h-5 w-5 text-foreground/70 stroke-[1.5]" aria-hidden />
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] border border-border/60 bg-white/55 backdrop-blur-md">
                <Brain className="h-5 w-5 text-foreground/70 stroke-[1.5]" aria-hidden />
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
