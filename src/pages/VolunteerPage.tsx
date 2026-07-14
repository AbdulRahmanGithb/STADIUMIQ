import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { MapPin, MessageCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const TASKS = [
  { id: 't1', desc: 'Direct fans from Gate B to Section 112', status: 'pending', time: '14:00' },
  { id: 't2', desc: 'Check ticket scanners at Gate C', status: 'completed', time: '13:30' },
  { id: 't3', desc: 'Assist accessible seating setup, Sec 100', status: 'pending', time: '15:00' },
  { id: 't4', desc: 'Report to Medical Station Alpha', status: 'pending', time: '16:00' },
];

export default function VolunteerPage() {
  const [tasks, setTasks] = useState(TASKS);
  const { language } = useAppStore();

  const completeTask = (id: string) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🙋 Volunteer Portal</h1>
        <p>Your match day assignment hub and AI support</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}><MapPin size={16} /> My Assignment</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 600 }}>Zone</span>
              <span style={{ color: 'var(--color-primary-light)' }}>Gate B - Concourse</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 600 }}>Role</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Wayfinding & Assistance</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 600 }}>Supervisor</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Sarah Jenkins</span>
            </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 600 }}>Shift</span>
              <span style={{ color: 'var(--color-text-muted)' }}>13:00 - 21:00</span>
            </div>
          </div>
        </div>

        <div className="card">
           <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}><CheckCircle size={16} /> Tasks</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
             {tasks.map(t => (
               <div key={t.id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                 <Clock size={14} color="var(--color-text-muted)" />
                 <span style={{ fontSize: '0.8rem', width: 45, color: 'var(--color-text-muted)' }}>{t.time}</span>
                 <span style={{ flex: 1, fontSize: '0.875rem', textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? 'var(--color-text-faint)' : 'var(--color-text)' }}>{t.desc}</span>
                 {t.status === 'pending' ? (
                   <button className="btn btn-sm btn-ghost" onClick={() => completeTask(t.id)}>Done</button>
                 ) : (
                   <CheckCircle size={16} color="var(--color-success)" />
                 )}
               </div>
             ))}
           </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}><MessageCircle size={16} /> Language Support</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
             Need to help a fan who speaks another language? Use the AI Assistant in the bottom right corner. It can translate live between 10+ languages. Current language set to: {language.toUpperCase()}
          </p>
           <div className="alert alert-info" style={{ marginBottom: 0 }}>
             <AlertTriangle size={18} />
             <div className="alert-content">
               <div className="alert-title">Emergency Protocols</div>
               <div className="alert-body">
                 Review emergency procedures for your zone. Evacuation route: South Exit 2.
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
