import React from 'react';
import { Accessibility, Volume2, Eye, Heart, MapPin, Phone } from 'lucide-react';

const SERVICES = [
  {
    icon: '♿',
    title: 'Wheelchair Access',
    description: 'Dedicated wheelchair-accessible entrances at Gates A (North) and F (South). Ramps available at all levels. Accessible seating in Sections 100–105.',
    status: 'Available',
    color: 'var(--color-success)',
  },
  {
    icon: '👁️',
    title: 'Visual Assistance',
    description: 'Audio-described match commentary headsets available at the Info Desk (Gate A). Tactile maps at all major entrances. Braille signage throughout.',
    status: 'Available',
    color: 'var(--color-success)',
  },
  {
    icon: '👂',
    title: 'Hearing Loop',
    description: 'Induction hearing loops installed throughout the stadium. Compatible with T-switch hearing aids. Sections 100, 200, 300 fully equipped.',
    status: 'Active',
    color: 'var(--color-success)',
  },
  {
    icon: '🤟',
    title: 'Sign Language',
    description: 'BSL and ASL interpreters stationed at Information Desks. Video relay service available at Accessibility Hub (Gate F). Match commentary available.',
    status: 'Available',
    color: 'var(--color-success)',
  },
  {
    icon: '🛗',
    title: 'Priority Elevators',
    description: 'Dedicated accessibility elevators at North and South towers. Priority access for wheelchair users, elderly, and families with strollers.',
    status: '3/4 Active',
    color: 'var(--color-warning)',
  },
  {
    icon: '🚐',
    title: 'Accessible Shuttle',
    description: 'Route 4 — Fully accessible shuttle with ramp access, running every 10 minutes from North Gate to the Accessibility Transport Hub.',
    status: 'On Route',
    color: 'var(--color-success)',
  },
];

export default function AccessibilityPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>♿ Accessibility Services</h1>
        <p>FIFA World Cup 2026 is committed to an inclusive experience for all fans</p>
      </div>

      {/* AI companion banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.08))',
        border: '1px solid rgba(59,130,246,0.25)', borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)', marginBottom: 'var(--space-6)',
        display: 'flex', gap: 'var(--space-5)', alignItems: 'center',
      }}>
        <div style={{ fontSize: '3rem' }}>🤖</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>AI Accessibility Companion</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', lineHeight: 1.7 }}>
            Your personal AI assistant understands your accessibility needs. Ask the StadiumIQ chatbot (bottom right) for personalized routing,
            real-time queue alerts for accessible facilities, and proactive notifications.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {['Find accessible restroom', 'Wheelchair route to my seat', 'Is the elevator working?', 'Audio description?'].map(q => (
              <span key={q} className="badge badge-primary">{q}</span>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => document.getElementById('ai-assistant-fab')?.click()}>Ask AI</button>
      </div>

      {/* Services grid */}
      <div className="grid-auto" style={{ marginBottom: 'var(--space-6)' }}>
        {SERVICES.map(svc => (
          <div key={svc.title} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: '2rem' }}>{svc.icon}</span>
              <span className={`badge`} style={{ background: `${svc.color}22`, color: svc.color }}>
                {svc.status}
              </span>
            </div>
            <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>{svc.title}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{svc.description}</p>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Priority queue info */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            <Heart size={16} color="var(--color-danger)" /> Priority Queue Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { location: 'Gate A — Accessible Entry', wait: '2 min', status: 'Low' },
              { location: 'Gate F — Accessibility Hub', wait: '1 min', status: 'Clear' },
              { location: 'Elevator — North Tower', wait: '3 min', status: 'Available' },
              { location: 'Medical Station — Alpha', wait: 'Immediate', status: 'Staffed' },
            ].map(q => (
              <div key={q.location} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{q.location}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Wait: {q.wait}</div>
                </div>
                <span className="badge badge-success">{q.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            <Phone size={16} color="var(--color-danger)" /> Emergency Contacts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { label: 'Accessibility Desk', number: 'Ext. 1800', available: '24/7' },
              { label: 'Medical Emergency', number: 'Ext. 911', available: 'Immediate' },
              { label: 'Stadium Control Room', number: 'Ext. 100', available: '24/7' },
              { label: 'Lost Property', number: 'Ext. 1550', available: '06:00–01:00' },
            ].map(c => (
              <div key={c.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{c.available}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary-light)' }}>{c.number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
