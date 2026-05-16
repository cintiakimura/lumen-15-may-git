import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceButton from './ui/VoiceButton';
import grokService from '@/components/services/grokService';
import { COACH_REASSURANCE_CLOSE, COACH_TRY_OR_SAVE } from '@/lib/grokCoach';
import { MASTERY_UNLOCK_THRESHOLD } from '@/lib/assessmentRemediation';
import { useAuth } from '@/lib/AuthContext';
import {
  getOrCreateLearnerProfile,
  recordUserTurnAndUpdateProfile,
  saveLearnerProfile,
} from '@/lib/learnerProfile';

const lessonCoachLastAtKey = (userId) => `lessonCoachLastAssistantAt:${userId}`;

const mentalIntroMessage = `You are on a **mental walk-through** — we picture the job (bay, roadside, workshop) and talk through what you would actually do.

When you are ready, tap **Begin** or say it aloud — I will set the first scene.`;

export default function ChatBox({
  lessonId,
  lessonContent,
  variant = 'lesson',
  courseTitle = '',
  lessonTitle = '',
  onMasteryUpdate,
  onComplete,
  className,
}) {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const messagesEndRef = useRef(null);
  const lastAssistantAtRef = useRef(null);
  const celebrationScheduledRef = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem(lessonCoachLastAtKey(userId));
    if (raw) lastAssistantAtRef.current = Number(raw);
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      const ts = Date.now();
      lastAssistantAtRef.current = ts;
      localStorage.setItem(lessonCoachLastAtKey(userId), String(ts));
    }
  }, [messages, userId]);

  useEffect(() => {
    const intro =
      variant === 'mental_scenario'
        ? mentalIntroMessage
        : `Alright, lad—you made it through the lesson. Next is a light oral check with me: a few practical or "teach it back" questions — no tick-box quiz. I keep my read on how solid it is; you will not see a score on screen.\n\n${COACH_REASSURANCE_CLOSE}\n\n${COACH_TRY_OR_SAVE}`;
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: intro,
        timestamp: new Date(),
      },
    ]);
    setShowCelebration(false);
    celebrationScheduledRef.current = false;
  }, [lessonId, variant]);

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const delaySec =
      lastAssistantAtRef.current != null
        ? Math.max(0, (Date.now() - lastAssistantAtRef.current) / 1000)
        : 0;

    let doc = getOrCreateLearnerProfile(userId);
    doc = recordUserTurnAndUpdateProfile(doc, { delaySec, userMessage: text.trim() });
    saveLearnerProfile(doc);

    const priorMessages = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const opts = { learnerProfileDoc: doc };
      if (variant === 'mental_scenario') {
        opts.courseTitle = courseTitle;
        opts.lessonTitle = lessonTitle || 'Mental scenario';
      }

      const result =
        variant === 'mental_scenario'
          ? await grokService.mentalScenarioTurn(lessonContent, priorMessages, text.trim(), opts)
          : await grokService.chatWithStudent(lessonContent, priorMessages, text.trim(), opts);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const ts = Date.now();
      lastAssistantAtRef.current = ts;
      localStorage.setItem(lessonCoachLastAtKey(userId), String(ts));

      if (result.mastery_score != null) {
        onMasteryUpdate?.(result.mastery_score);

        if (result.mastery_score >= MASTERY_UNLOCK_THRESHOLD && !celebrationScheduledRef.current) {
          celebrationScheduledRef.current = true;
          setShowCelebration(true);
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Bloody hell, you're flying—next one's on me.\n\n${COACH_REASSURANCE_CLOSE}\n\n${COACH_TRY_OR_SAVE}`,
                timestamp: new Date(),
                isSuccess: true,
              },
            ]);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I had a small hiccup there. Could you try saying that again?',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript);
    handleSend(transcript);
  };

  const showBeginMental =
    variant === 'mental_scenario' && !messages.some((m) => m.role === 'user');

  return (
    <div
      className={cn('flex h-full flex-col overflow-hidden rounded-xl', className)}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div
        className="px-5 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(201, 169, 110, 0.2)',
              border: '1px solid rgba(201, 169, 110, 0.3)',
            }}
          >
            <Sparkles className="h-5 w-5" style={{ color: '#C9A96E' }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Coach</h3>
            <p className="text-xs text-white/60">
              {variant === 'mental_scenario'
                ? 'Mental scenario — warm help, no judgment'
                : 'Oral check — practical questions, no quiz scores on screen'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}
            >
              <div
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                  message.role === 'user' ? '' : message.isSuccess ? '' : ''
                )}
                style={{
                  background:
                    message.role === 'user'
                      ? '#2A5D9A'
                      : message.isSuccess
                        ? '#C9A96E'
                        : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-[80%] rounded-2xl px-4 py-3"
                style={
                  message.role === 'user'
                    ? {
                        background: 'rgba(42, 93, 154, 0.9)',
                        color: 'white',
                        borderTopRightRadius: '4px',
                        backdropFilter: 'blur(10px)',
                      }
                    : message.isSuccess
                      ? {
                          background: 'rgba(201, 169, 110, 0.2)',
                          color: 'white',
                          border: '1px solid rgba(201, 169, 110, 0.4)',
                          borderTopLeftRadius: '4px',
                          backdropFilter: 'blur(10px)',
                        }
                      : {
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderTopLeftRadius: '4px',
                          backdropFilter: 'blur(10px)',
                        }
                }
              >
                <p className="text-sm leading-relaxed [overflow-wrap:anywhere]">{message.content}</p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}
            >
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 animate-bounce rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.5)', animationDelay: '0ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.5)', animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.5)', animationDelay: '300ms' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div
        className="p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {showCelebration && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
            <Button
              onClick={onComplete}
              className="w-full py-3 font-semibold text-white transition-all"
              style={{
                background: 'rgba(201, 169, 110, 0.2)',
                border: '2px solid rgba(201, 169, 110, 0.5)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Continue to Next Lesson
            </Button>
          </motion.div>
        )}

        {showBeginMental && (
          <div className="mb-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full border border-white/20 bg-white/10 py-3 text-white hover:bg-white/15"
              disabled={isLoading}
              onClick={() => handleSend("I'm ready — set the scene.")}
            >
              Begin walk-through
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <VoiceButton onTranscript={handleVoiceTranscript} size="md" disabled={isLoading} />

          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                variant === 'mental_scenario'
                  ? 'Type what you would do, or use the mic…'
                  : 'Type your message...'
              }
              disabled={isLoading}
              className="rounded-xl py-6 pr-12 text-white placeholder:text-white/40"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg transition-all"
              style={{
                background: 'rgba(42, 93, 154, 0.3)',
                border: '1px solid rgba(42, 93, 154, 0.5)',
                color: 'white',
              }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
