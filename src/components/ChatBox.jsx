import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceButton from './ui/VoiceButton';
import { lumen } from '@/api/lumenClient';

export default function ChatBox({ 
  lessonContent,
  onMasteryUpdate,
  onComplete,
  className 
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [masteryScore, setMasteryScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Great job finishing this lesson! 🎉 I'm here to help you master this material. Let's chat about what you learned — tell me something interesting you picked up, or ask me anything!",
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await lumen.functions.invoke('chatWithGrok', {
        lessonContent,
        messageHistory: messages.map(m => ({ role: m.role, content: m.content })),
        userMessage: text.trim()
      });

      const result = response.data;

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update mastery score
      if (result.mastery_score) {
        setMasteryScore(result.mastery_score);
        onMasteryUpdate?.(result.mastery_score);

        // Check if mastery achieved
        if (result.mastery_score >= 85 && !showCelebration) {
          setShowCelebration(true);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: "🌟 Excellent work! You've demonstrated strong understanding of this material. Ready to move on to the next lesson?",
              timestamp: new Date(),
              isSuccess: true
            }]);
          }, 500);
        }
      }

      // Handle frustration - show shorter supportive message
      if (result.is_frustrated) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 3).toString(),
            role: 'assistant',
            content: "Let's take it slow. No rush at all — you're doing great! 💙",
            timestamp: new Date()
          }]);
        }, 800);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I had a small hiccup there. Could you try saying that again?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript);
    handleSend(transcript);
  };

  return (
    <div className={cn('flex flex-col h-full rounded-xl overflow-hidden', className)} style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201, 169, 110, 0.2)', border: '1px solid rgba(201, 169, 110, 0.3)' }}>
            <Sparkles className="w-5 h-5" style={{ color: '#C9A96E' }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Grok Tutor</h3>
            <p className="text-xs text-white/60">Powered by xAI</p>
          </div>
          {masteryScore > 0 && (
            <div className="ml-auto">
              <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(201, 169, 110, 0.2)', border: '1px solid rgba(201, 169, 110, 0.4)', color: '#C9A96E' }}>
                {Math.round(masteryScore)}% mastery
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                message.role === 'user' 
                  ? '' 
                  : message.isSuccess 
                    ? '' 
                    : ''
              )} style={{ background: message.role === 'user' ? '#2A5D9A' : message.isSuccess ? '#C9A96E' : 'rgba(255, 255, 255, 0.1)' }}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-[80%] rounded-2xl px-4 py-3"
                style={message.role === 'user' 
                  ? { background: 'rgba(42, 93, 154, 0.9)', color: 'white', borderTopRightRadius: '4px', backdropFilter: 'blur(10px)' }
                  : message.isSuccess
                    ? { background: 'rgba(201, 169, 110, 0.2)', color: 'white', border: '1px solid rgba(201, 169, 110, 0.4)', borderTopLeftRadius: '4px', backdropFilter: 'blur(10px)' }
                    : { background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', borderTopLeftRadius: '4px', backdropFilter: 'blur(10px)' }
                }
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgba(255, 255, 255, 0.5)', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgba(255, 255, 255, 0.5)', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgba(255, 255, 255, 0.5)', animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4" style={{ background: 'rgba(255, 255, 255, 0.03)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <Button 
              onClick={onComplete}
              className="w-full font-semibold py-3 transition-all text-white"
              style={{ background: 'rgba(201, 169, 110, 0.2)', border: '2px solid rgba(201, 169, 110, 0.5)', backdropFilter: 'blur(10px)' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue to Next Lesson
            </Button>
          </motion.div>
        )}
        
        <div className="flex items-center gap-3">
          <VoiceButton 
            onTranscript={handleVoiceTranscript}
            size="md"
            disabled={isLoading}
          />
          
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={isLoading}
              className="pr-12 py-6 rounded-xl text-white placeholder:text-white/40"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg transition-all"
              style={{ background: 'rgba(42, 93, 154, 0.3)', border: '1px solid rgba(42, 93, 154, 0.5)', color: 'white' }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}