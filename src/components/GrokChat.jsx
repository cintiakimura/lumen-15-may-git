import React, { useState, useRef, useEffect } from 'react';
import { lumen } from '@/api/lumenClient';
import { isDemoMode } from '@/lib/demoMode';

export default function GrokChat({ user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('grokChatHistory');
    if (saved) {
      const history = JSON.parse(saved);
      setMessages(history);
      setConversationHistory(history.map(m => ({ role: m.role, content: m.content })));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const context = conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n');
      let text;
      if (isDemoMode()) {
        text = 'Demo mode: assistant replies are disabled. Connect the hosted app for live AI.';
      } else {
        const response = await lumen.integrations.Core.InvokeLLM({
          prompt: `Context:\n${context}\n\nUser: ${input}\n\nProvide a helpful, concise response.`
        });
        text = typeof response === 'string' ? response : JSON.stringify(response);
      }

      const assistantMessage = { role: 'assistant', content: text };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      setConversationHistory([...conversationHistory, userMessage, assistantMessage]);
      localStorage.setItem('grokChatHistory', JSON.stringify(updatedMessages));
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Error: Unable to get response. Please try again.' };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '120px',
      right: '32px',
      width: '400px',
      height: '500px',
      background: 'rgba(33, 33, 33, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #333333',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      maxHeight: '70vh'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #333333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 className="accurat-thin" style={{
          fontSize: '20px',
          color: '#00c600',
          margin: 0
        }}>
          Ask Grok
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#E0E0E0',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px 8px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 && (
          <div style={{
            color: '#4D4D4D',
            textAlign: 'center',
            paddingTop: '40px',
            fontSize: '14px'
          }}>
            Ask me anything about your courses, lessons, or learning!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: msg.role === 'user' ? '#00c600' : 'rgba(255, 255, 255, 0.05)',
              color: msg.role === 'user' ? '#000000' : '#E0E0E0',
              fontSize: '14px',
              lineHeight: '1.4',
              wordWrap: 'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#E0E0E0',
              fontSize: '14px'
            }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          borderTop: '1px solid #333333',
          padding: '12px',
          display: 'flex',
          gap: '8px'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question..."
          disabled={loading}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #333333',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#E0E0E0',
            fontSize: '13px',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: '#00c600',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#000000',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            opacity: loading ? 0.7 : 1
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}