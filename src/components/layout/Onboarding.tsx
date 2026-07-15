import React from 'react';
import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types';
import { Shield, Users, Clipboard, HelpCircle } from 'lucide-react';

const ROLES = [
  { id: 'fan', label: 'Fan / Attendee', icon: <Users size={32} />, desc: 'Find your way, get food, check transport' },
  { id: 'staff', label: 'Operations Staff', icon: <Shield size={32} />, desc: 'Manage incidents, monitor crowd density' },
  { id: 'organizer', label: 'Tournament Organizer', icon: <Clipboard size={32} />, desc: 'KPIs, sustainability, executive briefings' },
  { id: 'volunteer', label: 'Volunteer', icon: <HelpCircle size={32} />, desc: 'Zone assignments, assist fans, get help' },
];

export function Onboarding() {
  const { setRole, setOnboarded } = useAppStore();

  const handleSelect = (roleId: UserRole) => {
    setRole(roleId);
    setOnboarded(true);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--color-bg)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-6)'
    }}>
      <div style={{ textAlign: 'center', maxWidth: 600 }}>
        <div style={{ 
          width: 80, height: 80, margin: '0 auto var(--space-4)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', color: 'white', boxShadow: 'var(--shadow-lg)'
        }}>
          🏟️
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>Welcome to FanSetu AI</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: 'var(--space-8)' }}>
          FIFA World Cup 2026 — MetLife Stadium. Please select your role to customize your experience.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', textAlign: 'left' }}>
          {ROLES.map(r => (
            <button 
              key={r.id} 
              className="card" 
              style={{ cursor: 'pointer', border: '2px solid transparent', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
              onClick={() => handleSelect(r.id as UserRole)}
            >
              <div style={{ color: 'var(--color-primary)' }}>{r.icon}</div>
              <h3 style={{ fontSize: '1.2rem', marginTop: 'var(--space-2)' }}>{r.label}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
