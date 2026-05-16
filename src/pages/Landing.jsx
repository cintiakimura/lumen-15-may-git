import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { lumen } from '@/api/lumenClient';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const [showBooking, setShowBooking] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlatformLogin = () => {
    lumen.auth.redirectToLogin();
  };

  const getNextFriday2PM = () => {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    nextFriday.setHours(14, 0, 0, 0);
    return nextFriday;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const nextFriday = getNextFriday2PM();
      localStorage.setItem(
        'webinarBooking',
        JSON.stringify({
          name,
          email,
          date: nextFriday.toISOString(),
        })
      );
      setShowBooking(false);
      setName('');
      setEmail('');
      alert('Booking confirmed! Check your email.');
    } catch (error) {
      alert('Booking error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative flex items-center" style={{ minHeight: '67vh', padding: '32px' }}>
        <div className="absolute inset-0">
          <div className="grid grid-cols-2 h-full">
            <div className="relative h-full">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/lumen-prod/public/69816fdfc8b62c2372da0c4b/ee482fc99_Screenshot2026-02-03at074623.png"
                alt="Professional learning"
                className="w-full h-full object-cover opacity-70"
              />
            </div>
            <div className="relative h-full">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/lumen-prod/public/69816fdfc8b62c2372da0c4b/32b64ee3c_Screenshot2026-02-03at074745.png"
                alt="Student learning"
                className="w-full h-full object-cover opacity-70"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/80 via-[#1A1A1A]/60 to-[#1A1A1A]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-left">
          <h1
            className="mb-6 text-[30px] font-extralight leading-tight text-white drop-shadow-md"
          >
            Learning made for you, and just for you
          </h1>
          <p style={{ fontSize: '24px', color: '#FFFFFF', maxWidth: '800px', marginBottom: '32px' }}>
            Cutting-edge AI meets neuroscience to transform any course into a truly personalized learning
            experience
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePlatformLogin}
              className="btn-primary uppercase tracking-wider"
              style={{ height: '48px' }}
            >
              Sign in (hosted)
            </button>
            <Link
              to={`${createPageUrl('Login')}?demo=true`}
              className="btn-outline uppercase tracking-wider inline-flex items-center justify-center"
              style={{ height: '48px', textDecoration: 'none' }}
            >
              Demo mode (local)
            </Link>
            <button
              type="button"
              onClick={() => (window.location.href = '#')}
              className="btn-outline uppercase tracking-wider"
              style={{ height: '48px' }}
            >
              Try for free
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="mb-3 text-[28.8px] font-extralight text-primary">
                Nobody learns the same way
              </h3>
              <p style={{ fontSize: '19.2px', color: '#FFFFFF', lineHeight: 1.6 }}>
                Some need to talk it out,
                <br />
                Some need to see it first,
                <br />
                Some need to imagine it step by step
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="mb-3 text-[28.8px] font-extralight text-primary">
                Your brain your choice
              </h3>
              <p style={{ fontSize: '19.2px', color: '#FFFFFF', lineHeight: 1.6 }}>
                You set your rhythm,
                <br />
                We adapt — to your pace, your style, even your mood,
                <br />
                Short bursts when you&apos;re overwhelmed. Deeper dives when you&apos;re in flow
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="mb-3 text-[28.8px] font-extralight text-primary">
                Empowering teachers
              </h3>
              <p style={{ fontSize: '19.2px', color: '#FFFFFF', lineHeight: 1.6 }}>
                Upload your content (videos, PDFs, text, anything),
                <br />
                We reshape it so it fits you — and every person in your team.
                <br />
                The result: real retention, real mastery, real progress
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted px-6 py-12 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="mb-4 text-2xl font-extralight text-foreground lg:text-3xl">
            A method backed by more than 103 studies
          </h2>

          <div className="space-y-8 text-left max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl text-primary-foreground">AI</span>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-extralight text-primary">You are not a number</h3>
                <p className="text-muted-foreground">
                  For the first time a the learning experience designed to completely adapt to each individual user,
                  same content unique experiences. From podcasts, videos, slides until deep conversations, you choose
                  what works for you
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl text-primary-foreground">🧠</span>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-extralight text-primary">You are not alone</h3>
                <p className="text-muted-foreground">
                  We will support and adapt until you succeed, no judgement, no pressure, because knowledge is yours,
                  forever
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
