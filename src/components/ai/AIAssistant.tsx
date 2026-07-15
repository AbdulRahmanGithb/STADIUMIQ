/**
 * AIAssistant.tsx — FanSetu AI
 * Floating AI chat panel. Role-aware, multilingual, voice-enabled.
 * FR-3: multilingual chat | FR-3.4: voice input | FR-3.5: conversation history
 */
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Globe, Bot } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { ChatMessage, Language } from '../../types';
import { sendMessage, getLanguageGreeting } from '../../services/geminiService';

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  fan: ['Where is my seat?', 'Nearest food court?', 'When is the next shuttle?', 'Accessibility services?'],
  staff: ['Current crowd hotspots?', 'Active incidents status?', 'AI dispatch recommendation?', 'Gate overflow protocol?'],
  organizer: ['Generate match briefing', 'Sustainability status?', 'KPI summary for tonight?', 'Staffing recommendations?'],
  volunteer: ['My zone assignment?', 'Emergency protocol?', 'Accessibility help nearby?', 'Shift handover instructions?'],
};

const LANG_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
];

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  fan: { label: '⚽ Fan', color: 'var(--color-primary)' },
  staff: { label: '👷 Staff', color: 'var(--color-warning)' },
  organizer: { label: '📋 Organizer', color: 'var(--color-info)' },
  volunteer: { label: '🤝 Volunteer', color: 'var(--color-success)' },
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { role, language, setLanguage } = useAppStore();

  // Initialize greeting whenever language or role changes (FR-3.3)
  useEffect(() => {
    const greeting = getLanguageGreeting(language);
    setMessages([{
      id: 'init',
      role: 'ai',
      content:
        `${greeting} I'm FanSetu AI 🌐\n\n` +
        `I'm your ${ROLE_BADGE[role]?.label} assistant for FIFA World Cup 2026 at MetLife Stadium. ` +
        `Ask me anything about navigation, transport, food, incidents, or match-day info! ⚽`,
      timestamp: Date.now(),
    }]);
  }, [language, role]);

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
      setMessages(prev => [...prev, { id: `ai-${Date.now()}`, role: 'ai', content: response, timestamp: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: 'ai',
        content: '⚠️ Connection issue. Please try again in a moment.',
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  // Voice input (FR-3.4) via Web Speech API
  function handleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice input is not supported in this browser. Please use Chrome.'); return; }
    const recognition = new SR();
    const langMap: Record<Language, string> = {
      en: 'en-US', es: 'es-ES', fr: 'fr-FR', ar: 'ar-SA', pt: 'pt-BR',
      de: 'de-DE', zh: 'zh-CN', ja: 'ja-JP', hi: 'hi-IN', ur: 'ur-PK',
    };
    recognition.lang = langMap[language] || 'en-US';
    setListening(true);
    recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  const suggestions = SUGGESTED_QUESTIONS[role] || SUGGESTED_QUESTIONS.fan;
  const currentLang = LANG_OPTIONS.find(l => l.code === language) || LANG_OPTIONS[0];
  const badge = ROLE_BADGE[role];

  return (
    <>
      {/* Floating action button */}
      <button
        className="ai-fab"
        onClick={() => setOpen(v => !v)}
        title="Open FanSetu AI Assistant"
        id="ai-assistant-fab"
        aria-label="Open AI Assistant"
      >
        {open ? <X size={24} aria-hidden /> : <Bot size={24} aria-hidden />}
        {!open && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: 'var(--color-danger)', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: '0.6rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--color-bg)',
          }}>AI</span>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="ai-panel" id="ai-assistant-panel" role="dialog" aria-label="FanSetu AI Chat">
          {/* Header */}
          <div className="ai-panel-header">
            <div className="ai-avatar" aria-hidden>🤖</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ai-panel-title">FanSetu AI</div>
              <div className="ai-panel-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ background: badge.color, borderRadius: 4, padding: '1px 5px', fontSize: '0.65rem', color: 'white', fontWeight: 700 }}>
                  {badge.label}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>· Gemini Powered</span>
              </div>
            </div>

            {/* Language picker trigger */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowLangPicker(v => !v)}
              title="Change language"
              aria-label={`Change language — current: ${currentLang.label}`}
              style={{ padding: '4px 8px', fontSize: '1rem' }}
            >
              {currentLang.flag}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setOpen(false)}
              aria-label="Close AI assistant"
              style={{ padding: '4px 8px' }}
            >
              <X size={14} aria-hidden />
            </button>
          </div>

          {/* Language picker dropdown */}
          {showLangPicker && (
            <div style={{
              padding: 'var(--space-3)',
              borderBottom: '1px solid var(--color-border)',
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-1)',
            }}>
              {LANG_OPTIONS.map(l => (
                <button
                  key={l.code}
                  className={`btn btn-sm ${language === l.code ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => { setLanguage(l.code); setShowLangPicker(false); }}
                  title={l.label}
                  style={{ padding: '4px', fontSize: '1rem' }}
                >
                  {l.flag}
                </button>
              ))}
            </div>
          )}

          {/* Suggested questions (only shown initially) */}
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

          {/* Messages list */}
          <div className="ai-messages" role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map(msg => (
              <div key={msg.id} className={`ai-message ${msg.role}`}>
                {msg.role === 'ai' && (
                  <div className="ai-avatar" style={{ width: 28, height: 28, fontSize: '0.8rem', flexShrink: 0 }} aria-hidden>🤖</div>
                )}
                <div className="ai-message-bubble">
                  {msg.content.split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message ai" aria-label="AI is typing">
                <div className="ai-avatar" style={{ width: 28, height: 28, fontSize: '0.8rem' }} aria-hidden>🤖</div>
                <div className="ai-typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div className="ai-input-row">
            <button
              className={`btn btn-ghost btn-sm${listening ? ' active' : ''}`}
              onClick={handleVoice}
              title="Voice Input"
              aria-label={listening ? 'Stop listening' : 'Start voice input'}
              style={{ flexShrink: 0, color: listening ? 'var(--color-danger)' : undefined }}
            >
              {listening ? <MicOff size={16} aria-hidden /> : <Mic size={16} aria-hidden />}
            </button>
            <textarea
              className="ai-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask anything (${currentLang.flag} ${currentLang.label})...`}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1}
              aria-label="Message input"
              maxLength={500}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              style={{ flexShrink: 0 }}
            >
              <Send size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
