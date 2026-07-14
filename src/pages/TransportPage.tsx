import React from 'react';
import { TransportBoard } from '../components/transport/TransportBoard';
import { MapPin, Navigation, Clock } from 'lucide-react';

export default function TransportPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🚌 Transport Hub</h1>
        <p>Real-time shuttle tracking, AI-optimized departure recommendations, and last-mile navigation</p>
      </div>

      {/* Quick stats */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Active Routes', value: '4', icon: '🚌', color: 'var(--color-primary)' },
          { label: 'Avg Wait Time', value: '6 min', icon: '⏱️', color: 'var(--color-info)' },
          { label: 'Fans Transported', value: '12,400', icon: '👥', color: 'var(--color-success)' },
          { label: 'On-Time Rate', value: '87%', icon: '✅', color: 'var(--color-success)' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.color } as React.CSSProperties}>
            <div style={{ fontSize: '1.5rem' }}>{k.icon}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize: '1.6rem', color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Shuttle board */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <TransportBoard />
        </div>

        {/* Directions */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            <MapPin size={16} /> Getting to the Stadium
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
            {[
              { mode: '🚆 NJ Transit', detail: 'Meadowlands Sports Complex Station → 5 min walk', eta: '12 min' },
              { mode: '🚌 Express Bus', detail: 'Port Authority Bus Terminal → Direct service', eta: '25 min' },
              { mode: '🚗 Park & Ride', detail: 'Zones P1–P7 · $35 event parking', eta: 'Now Open' },
              { mode: '🚁 Helicopter', detail: 'VIP/Accessibility · Helipad East', eta: 'By Appt' },
            ].map(t => (
              <div key={t.mode} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)',
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.mode}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.detail}</div>
                </div>
                <span className="badge badge-info">{t.eta}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Post-match planning */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            <Clock size={16} /> Post-Match Exit Planning
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            AI predicts post-match congestion based on current attendance. Plan your exit:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[
              { time: 'Final Whistle +0', crowd: 'Critical', tip: 'Stay in your seat 5–10 min', color: 'var(--color-danger)' },
              { time: 'Final Whistle +10', crowd: 'High', tip: 'Exit via Gate D (West)', color: 'var(--color-warning)' },
              { time: 'Final Whistle +20', crowd: 'Moderate', tip: 'Best time to leave', color: 'var(--color-accent)' },
              { time: 'Final Whistle +30', crowd: 'Low', tip: 'Clear conditions — all routes open', color: 'var(--color-success)' },
            ].map(row => (
              <div key={row.time} style={{
                display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface)', borderLeft: `3px solid ${row.color}`,
              }}>
                <div style={{ minWidth: 130, fontSize: '0.8rem', fontWeight: 600 }}>{row.time}</div>
                <span className="badge" style={{ background: `${row.color}22`, color: row.color, minWidth: 80, justifyContent: 'center' }}>
                  {row.crowd}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{row.tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
