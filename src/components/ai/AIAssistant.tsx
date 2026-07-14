import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Globe } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ChatMessage, Language } from '../../types';
import { sendMessage, getLanguageGreeting } from '../../services/geminiService';

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  fan: ['Where is my seat?', 'Nearest food court?', 'When is the next shuttle?', 'Accessibility services?'],
  staff: ['Current crowd hotspots?', 'Active incidents?', 'Staff deployment status?', 'Recommend dispatch?'],
  organizer: ['Generate match briefing', 'Sustainability status?', 'KPI summary?', 'Staffing recommendations?'],
  volunteer: ['My zone assignment?', 'Emergency protocol?', 'Accessibility help nearby?', 'Shift handover notes?'],
};

const LANG_FLAGS: Record<Language, string> = {
  en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', ar: '🇸🇦', pt: '🇧🇷',
  de: '🇩🇪', zh: '🇨🇳', ja: '🇯🇵', hi: '🇮🇳', ur: '🇵🇰',
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { role, language } = useAppStore();

  // Initialize greeting
  useEffect(() => {
    const greeting = getLanguageGreeting(language);
    setMessages([{
      id: 'init',
      role: 'ai',
      content: `${greeting} I'm here to help with navigation, transport, facilities, and anything you need at MetLife Stadium today. ⚽\n\nBrazil vs Argentina kicks off in ~2 hours — let's make your match day amazing!`,
      timestamp: Date.now(),
    }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: msg, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendMessage(msg, messages, role, language);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`, role: 'ai', content: response, timestamp: Date.now(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: 'ai',
        content: 'Sorry, I encountered an issue. Please try again.',
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleVoice() {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser.');
      return;
    }
    const recognition = new (SpeechRecognition as new () => { lang: string; onresult: ((e: { results: { transcript: string }[][] }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void })();
    recognition.lang = language === 'ar' ? 'ar-SA' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US';
    setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  const suggestions = SUGGESTED_QUESTIONS[role] || SUGGESTED_QUESTIONS.fan;

  return (
    <>
      {/* FAB */}
      <button
        className="ai-fab"
        onClick={() => setOpen(v => !v)}
        title="Open AI Assistant"
        id="ai-assistant-fab"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="ai-panel" id="ai-assistant-panel">
          <div className="ai-panel-header">
            <div className="ai-avatar">🤖</div>
            <div>
              <div className="ai-panel-title">StadiumIQ AI Assistant</div>
              <div className="ai-panel-subtitle">
                {LANG_FLAGS[language]} Online · Gemini Powered
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setOpen(false)}>
              <X size={14} />
            </button>
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`ai-message ${msg.role}`}>
                {msg.role === 'ai' && (
                  <div className="ai-avatar" style={{ width: 28, height: 28, fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
                )}
                <div className="ai-message-bubble">
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message ai">
                <div className="ai-avatar" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>🤖</div>
                <div className="ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-input-row">
            <button
              className={`btn btn-ghost btn-sm${listening ? ' active' : ''}`}
              onClick={handleVoice}
              title="Voice Input"
              style={{ flexShrink: 0, color: listening ? 'var(--color-danger)' : undefined }}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <textarea
              className="ai-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask anything... (${language.toUpperCase()})`}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{ flexShrink: 0 }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
