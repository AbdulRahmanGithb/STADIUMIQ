import React from 'react';
import { Bell, Globe, ChevronDown } from 'lucide-react';
import { RoleSelector } from './RoleSelector';
import { useAppStore } from '../../store/appStore';
import { Language } from '../../types';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: '🇺🇸 EN' },
  { code: 'es', label: '🇪🇸 ES' },
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'ar', label: '🇸🇦 AR' },
  { code: 'pt', label: '🇧🇷 PT' },
  { code: 'de', label: '🇩🇪 DE' },
  { code: 'zh', label: '🇨🇳 ZH' },
  { code: 'ja', label: '🇯🇵 JA' },
  { code: 'hi', label: '🇮🇳 HI' },
  { code: 'ur', label: '🇵🇰 UR' },
];

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { language, setLanguage, alerts } = useAppStore();
  const [showLang, setShowLang] = React.useState(false);
  const unreadCount = alerts.filter(a => !a.dismissed).length;

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <RoleSelector />

        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowLang(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
          >
            <Globe size={14} />
            {LANGUAGES.find(l => l.code === language)?.label}
            <ChevronDown size={12} />
          </button>
          {showLang && (
            <div style={{
              position: 'absolute', top: '110%', right: 0,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-2)',
              minWidth: 140, zIndex: 300, display: 'flex', flexDirection: 'column', gap: 2,
              boxShadow: 'var(--shadow-lg)',
            }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  className={`btn btn-ghost btn-sm${language === l.code ? ' active' : ''}`}
                  style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
                  onClick={() => { setLanguage(l.code); setShowLang(false); }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alerts Bell */}
        <button className="btn btn-ghost btn-sm" style={{ position: 'relative' }}>
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: 'var(--color-danger)', color: 'white',
              fontSize: '0.6rem', fontWeight: 700,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Match Timer */}
        <MatchTimer />
      </div>
    </header>
  );
}

function MatchTimer() {
  const [timeLeft, setTimeLeft] = React.useState('');
  const kickoff = Date.now() + 2 * 60 * 60 * 1000;

  React.useEffect(() => {
    const update = () => {
      const diff = kickoff - Date.now();
      if (diff <= 0) { setTimeLeft('LIVE 🔴'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [kickoff]);

  return (
    <div style={{
      background: 'var(--color-card)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '4px var(--space-3)',
      fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)',
      color: 'var(--color-accent)', whiteSpace: 'nowrap',
    }}>
      ⚽ BRA vs ARG · {timeLeft}
    </div>
  );
}
