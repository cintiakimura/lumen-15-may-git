import React, { useState, useRef, useEffect } from 'react';
import grokService from '@/components/services/grokService';
import {
  getOrCreateLearnerProfile,
  recordUserTurnAndUpdateProfile,
  saveLearnerProfile,
} from '@/lib/learnerProfile';

const lastAtKey = (userId) => `grokCoachLastAssistantAt:${userId}`;

export default function GrokChat({ user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mentalSimulation, setMentalSimulation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const lastAssistantAtRef = useRef(null);

  const userId = user?.id || 'anonymous';

  useEffect(() => {
    const saved = localStorage.getItem('grokChatHistory');
    if (saved) {
      const history = JSON.parse(saved);
      setMessages(history);
      setConversationHistory(history.map((m) => ({ role: m.role, content: m.content })));
    }
    const raw = localStorage.getItem(lastAtKey(userId));
    lastAssistantAtRef.current = raw ? Number(raw) : null;
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role === 'assistant' && lastAssistantAtRef.current == null) {
      const ts = Date.now();
      lastAssistantAtRef.current = ts;
      localStorage.setItem(lastAtKey(userId), String(ts));
    }
  }, [messages, userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const delaySec =
      lastAssistantAtRef.current != null
        ? Math.max(0, (Date.now() - lastAssistantAtRef.current) / 1000)
        : 0;

    let doc = getOrCreateLearnerProfile(userId);
    doc = recordUserTurnAndUpdateProfile(doc, { delaySec, userMessage: userMessage.content });
    saveLearnerProfile(doc);

    try {
      const text = await grokService.coachFreeChat(
        conversationHistory,
        userMessage.content,
        '',
        { learnerProfileDoc: doc, mentalSimulation }
      );

      const assistantMessage = { role: 'assistant', content: text };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      setConversationHistory([...conversationHistory, userMessage, assistantMessage]);
      localStorage.setItem('grokChatHistory', JSON.stringify(updatedMessages));
      const now = Date.now();
      lastAssistantAtRef.current = now;
      localStorage.setItem(lastAtKey(userId), String(now));
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Had a hiccup there, mate—try that again when you can.' };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full max-h-[88dvh] flex-col overflow-hidden md:max-h-full">
      <div className="flex shrink-0 flex-col gap-2 border-b border-border px-4 py-3 pt-4 md:pt-3">
        <div className="flex items-center justify-between gap-3">
        <h2 className="accurat-thin m-0 text-lg text-primary md:text-xl">Coach</h2>
        <button
          type="button"
          onClick={onClose}
          className="touch-target flex shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-lg text-foreground hover:bg-muted"
        >
          ✕
        </button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={mentalSimulation}
            onChange={(e) => setMentalSimulation(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Mental scenarios (imagination walk-throughs, not a quiz)
        </label>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="px-2 pt-6 text-center text-sm leading-relaxed text-muted-foreground">
            {mentalSimulation
              ? 'Describe a symptom or a situation — I will paint short bay or roadside scenes and ask what you would do next. No quiz, just mentoring.'
              : "Courses, lessons, life—say what's on your mind. I'm not testing you."}
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed [overflow-wrap:anywhere] sm:max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/60 bg-muted/50 text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm text-foreground">
              Give me a sec…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex shrink-0 gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say it how you'd say it out loud…"
          disabled={loading}
          className="min-h-touch min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 font-sans text-base text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="touch-target shrink-0 rounded-lg border-0 bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
