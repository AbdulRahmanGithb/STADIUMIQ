import React, { useState } from 'react';
import { StadiumMap } from '../components/navigation/StadiumMap';
import { Map, Navigation, Accessibility, Search } from 'lucide-react';

export default function NavigationPage() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [query, setQuery] = useState('');

  const QUICK_FIND = [
    { emoji: '🍔', label: 'Food & Beverages' },
    { emoji: '🚻', label: 'Restrooms' },
    { emoji: '🏥', label: 'Medical Station' },
    { emoji: '♿', label: 'Accessible Routes' },
    { emoji: '🚪', label: 'Emergency Exits' },
    { emoji: '🛍️', label: 'Official Store' },
    { emoji: 'ℹ️', label: 'Info Desk' },
    { emoji: '🎉', label: 'Fan Zones' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🗺️ Smart Navigation</h1>
        <p>AI-powered indoor navigation with real-time crowd routing</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            style={{
              width: '100%', background: 'var(--color-card)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: '10px 12px 10px 36px',
              color: 'var(--color-text)', fontSize: '0.875rem', outline: 'none',
            }}
            placeholder="Search: Gate A, Food Court, Section 114..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button
          className={`btn ${showAccessibility ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setShowAccessibility(v => !v)}
        >
          <Accessibility size={16} /> Accessibility Route
        </button>
      </div>

      {/* Quick Find */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {QUICK_FIND.map(q => (
          <button key={q.label} className="btn btn-ghost btn-sm" onClick={() => alert(`Locating nearest ${q.label}...`)}>
            {q.emoji} {q.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <StadiumMap showAccessibility={showAccessibility} />

      {/* Info cards */}
      <div className="grid-3" style={{ marginTop: 'var(--space-5)' }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-3)' }}><Navigation size={16} /> Your Location</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Section 114, Row 12, Seat 7</div>
            Level 1 · South End · Gate C entrance
          </div>
          <div style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--color-success)', fontWeight: 500 }}>✅ Seat verified via ticket scan</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-3)' }}>⚡ AI Route Tips</div>
          <ul style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', paddingLeft: 'var(--space-4)', lineHeight: 2 }}>
            <li>Gate D (West) has lowest queue: 31%</li>
            <li>Food Court Level 1 is at 91% — try Level 2</li>
            <li>Restrooms near Section 220 are less busy</li>
            <li>East Gate congestion — allow +8 min</li>
          </ul>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-3)' }}><Map size={16} /> Stadium Guide</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '0.8rem' }}>
            {[
              ['Gate A', 'North – Main Entrance', 'var(--color-success)'],
              ['Gate B', 'East – Side Entrance', 'var(--color-warning)'],
              ['Gate C', 'South – Main Entrance', 'var(--color-success)'],
              ['Gate D', 'West – Overflow', 'var(--color-success)'],
            ].map(([g, d, c]) => (
              <div key={g} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600 }}>{g}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{d}</span>
                <div className="legend-dot" style={{ background: c }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
