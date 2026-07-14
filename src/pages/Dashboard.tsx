import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { crowdSimulator } from '../services/crowdSimulator';
import { CrowdData } from '../types';
import { Users, Bus, ShieldAlert, Leaf, Zap, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const { role, incidents, alerts, dismissAlert } = useAppStore();
  const [crowdData, setCrowdData] = useState<CrowdData | null>(crowdSimulator.getCurrentCrowdData());

  useEffect(() => {
    crowdSimulator.start();
    const unsub = crowdSimulator.onCrowdUpdate(setCrowdData);
    return () => { unsub(); crowdSimulator.stop(); };
  }, []);

  const pct = crowdData ? Math.round((crowdData.totalAttendance / crowdData.capacity) * 100) : 0;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const activeAlerts = alerts.filter(a => !a.dismissed);

  // Role-specific content
  const ROLE_CONTENT = {
    fan: {
      title: '🏟️ Welcome to MetLife Stadium',
      subtitle: 'Your AI companion for the ultimate World Cup experience',
      emoji: '⚽',
    },
    staff: {
      title: '👷 Operations Dashboard',
      subtitle: 'Stadium operations & incident management center',
      emoji: '🛡️',
    },
    organizer: {
      title: '📋 Command Center',
      subtitle: 'FIFA World Cup 2026 — Organizer Overview',
      emoji: '📊',
    },
    volunteer: {
      title: '🙋 Volunteer Portal',
      subtitle: 'Your assignment hub for today\'s match',
      emoji: '🤝',
    },
  };

  const content = ROLE_CONTENT[role];

  const radarData = [
    { metric: 'Crowd Flow', value: 72 },
    { metric: 'Safety', value: 88 },
    { metric: 'Transport', value: 65 },
    { metric: 'Sustainability', value: 72 },
    { metric: 'Fan Experience', value: 84 },
    { metric: 'Accessibility', value: 90 },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(251,191,36,0.08) 50%, rgba(59,130,246,0.05) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        marginBottom: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          fontSize: '10rem', opacity: 0.04, pointerEvents: 'none', userSelect: 'none',
        }}>
          {content.emoji}
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div className="live-dot" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>LIVE · FIFA World Cup 2026</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-2)' }}>{content.title}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: 'var(--space-5)' }}>{content.subtitle}</p>

          {/* Match card */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-6)',
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-6)', backdropFilter: 'blur(8px)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem' }}>🇧🇷</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>Brazil</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>BRA</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Group C</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-accent)' }}>VS</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>~2h to kickoff</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem' }}>🇦🇷</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>Argentina</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>ARG</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Alerts */}
      {activeAlerts.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          {activeAlerts.slice(0, 3).map(alert => (
            <div key={alert.id} className={`alert alert-${alert.type}`} style={{ position: 'relative' }}>
              <div className="alert-content">
                <div className="alert-body">{alert.message}</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => dismissAlert(alert.id)}
                style={{ flexShrink: 0, padding: '2px 6px' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-primary)' } as React.CSSProperties}>
          <div className="kpi-icon"><Users size={20} color="var(--color-primary)" /></div>
          <div className="kpi-label">Total Attendance</div>
          <div className="kpi-value">{crowdData ? crowdData.totalAttendance.toLocaleString() : '—'}</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> {pct}% capacity</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': activeIncidents > 0 ? 'var(--color-warning)' : 'var(--color-success)' } as React.CSSProperties}>
          <div className="kpi-icon"><ShieldAlert size={20} color={activeIncidents > 0 ? 'var(--color-warning)' : 'var(--color-success)'} /></div>
          <div className="kpi-label">Active Incidents</div>
          <div className="kpi-value" style={{ color: activeIncidents > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>{activeIncidents}</div>
          <div className="kpi-change neutral">{incidents.filter(i => i.status === 'resolved').length} resolved</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-info)' } as React.CSSProperties}>
          <div className="kpi-icon"><Bus size={20} color="var(--color-info)" /></div>
          <div className="kpi-label">Shuttle Load</div>
          <div className="kpi-value">68%</div>
          <div className="kpi-change neutral">4 routes active</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--color-success)' } as React.CSSProperties}>
          <div className="kpi-icon"><Leaf size={20} color="var(--color-success)" /></div>
          <div className="kpi-label">Sustainability</div>
          <div className="kpi-value">72/100</div>
          <div className="kpi-change positive"><Zap size={12} /> 67% renewable</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid-2" style={{ marginTop: 'var(--space-6)' }}>
        {/* Radar chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Star size={16} /> Stadium Operations Score</div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.8rem' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Live alerts feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><AlertTriangle size={16} /> Recent Incidents</div>
            <div className="live-dot" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {incidents.slice(0, 4).map(inc => (
              <div key={inc.id} style={{
                display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)',
                background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)',
                borderLeft: `3px solid ${inc.severity === 'high' || inc.severity === 'critical' ? 'var(--color-danger)' : inc.severity === 'medium' ? 'var(--color-warning)' : 'var(--color-success)'}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inc.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    📍 {inc.location} · {Math.floor((Date.now() - inc.reportedAt) / 60000)}m ago
                  </div>
                </div>
                <span className={`badge ${inc.status === 'resolved' ? 'badge-success' : inc.status === 'in-progress' ? 'badge-info' : 'badge-warning'}`}>
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role-specific quick actions */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header">
          <div className="card-title">Quick Actions</div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {role === 'fan' && <>
            <button className="btn btn-primary" onClick={() => alert('Navigating to your seat...')}>🗺️ Find My Seat</button>
            <button className="btn btn-ghost" onClick={() => alert('Locating nearest food vendors...')}>🍔 Nearest Food</button>
            <button className="btn btn-ghost" onClick={() => alert('Opening transport schedules...')}>🚌 Transport Info</button>
            <button className="btn btn-ghost" onClick={() => alert('Opening accessibility services...')}>♿ Accessibility</button>
          </>}
          {role === 'staff' && <>
            <button className="btn btn-danger" onClick={() => alert('Opening incident report form...')}>🚨 Report Incident</button>
            <button className="btn btn-primary" onClick={() => alert('Dispatching nearest response team...')}>📡 Dispatch Team</button>
            <button className="btn btn-ghost" onClick={() => alert('Opening shift handover notes...')}>📋 Shift Handover</button>
            <button className="btn btn-ghost" onClick={() => alert('Broadcasting alert to all staff...')}>📻 Broadcast Alert</button>
          </>}
          {role === 'organizer' && <>
            <button className="btn btn-accent" onClick={() => document.getElementById('generate-briefing-btn')?.click()}>📊 Generate Briefing</button>
            <button className="btn btn-primary" onClick={() => alert('Opening detailed analytics dashboard...')}>📈 View Analytics</button>
            <button className="btn btn-ghost" onClick={() => alert('Generating sustainability report...')}>🌱 Sustainability Report</button>
            <button className="btn btn-ghost" onClick={() => alert('Publishing update to all portals...')}>📢 Publish Update</button>
          </>}
          {role === 'volunteer' && <>
            <button className="btn btn-primary" onClick={() => alert('Showing your assigned zone...')}>📍 My Zone</button>
            <button className="btn btn-ghost" onClick={() => alert('Opening interactive stadium map...')}>🗺️ Stadium Map</button>
            <button className="btn btn-ghost" onClick={() => alert('You are checked in!')}>🤝 Check In</button>
            <button className="btn btn-ghost" onClick={() => alert('Initiating call to supervisor...')}>📞 Contact Supervisor</button>
          </>}
        </div>
      </div>
    </div>
  );
}
