import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceButton({ 
  onTranscript, 
  size = 'lg',
  className,
  disabled 
}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice input not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      setIsListening(false);
      
      setTimeout(() => {
        setIsProcessing(false);
        if (onTranscript && transcript) {
          onTranscript(transcript);
        }
      }, 300);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setIsProcessing(false);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied');
      } else if (event.error === 'no-speech') {
        setError('No speech detected');
      } else {
        setError('Voice input failed');
      }
      setTimeout(() => setError(null), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const handleClick = () => {
    if (disabled || isProcessing || error) return;
    
    if (!isListening) {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        setError('Failed to start voice input');
        setTimeout(() => setError(null), 3000);
      }
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      title={isListening ? 'Stop recording' : 'Start voice input'}
      className={cn(
        'group relative flex items-center justify-center rounded-full transition-all duration-300',
        sizeClasses[size],
        isListening 
          ? 'bg-red-50 border-2 border-red-500' 
          : 'border-2 border-primary bg-background hover:bg-primary hover:text-primary-foreground',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Loader2 className={cn('animate-spin text-primary', iconSizes[size])} />
          </motion.div>
        ) : isListening ? (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Mic className={cn('text-red-500', iconSizes[size])} />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Mic className={cn('text-primary transition-colors group-hover:text-primary-foreground', iconSizes[size])} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {isListening && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-red-500"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-red-400"
            initial={{ opacity: 0.4, scale: 1 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </motion.button>
  );
}