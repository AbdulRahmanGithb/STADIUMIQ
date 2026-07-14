import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Incident } from '../../types';
import { ShieldAlert, Clock, User, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { analyzeIncident } from '../../services/geminiService';

const SEVERITY_BADGE: Record<string, string> = {
  low: 'badge-success', medium: 'badge-warning', high: 'badge-danger', critical: 'badge-danger',
};
const STATUS_BADGE: Record<string, string> = {
  open: 'badge-danger', assigned: 'badge-warning', 'in-progress': 'badge-info', resolved: 'badge-success',
};
const CATEGORY_ICON: Record<string, string> = {
  medical: '🏥', security: '🛡️', crowd: '👥', technical: '⚙️', fire: '🔥', other: '📋',
};

function IncidentRow({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(false);
  const [protocol, setProtocol] = useState(incident.aiProtocol || '');
  const [loadingProtocol, setLoadingProtocol] = useState(false);
  const { updateIncidentStatus } = useAppStore();

  async function fetchProtocol() {
    setLoadingProtocol(true);
    const result = await analyzeIncident(incident as unknown as Record<string, unknown>);
    setProtocol(result);
    setLoadingProtocol(false);
  }

  const elapsed = Math.floor((Date.now() - incident.reportedAt) / 60000);

  return (
    <div className={`incident-card ${incident.severity}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '1.4rem' }}>{CATEGORY_ICON[incident.category]}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{incident.title}</span>
              <span className={`badge ${SEVERITY_BADGE[incident.severity]}`}>{incident.severity}</span>
              <span className={`badge ${STATUS_BADGE[incident.status]}`}>{incident.status}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              📍 {incident.location}
              {incident.assignedTo && <> · 👤 {incident.assignedTo}</>}
              <> · <Clock size={10} style={{ display: 'inline' }} /> {elapsed}m ago</>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
            {incident.status !== 'resolved' && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                title="Mark Resolved"
              >
                <CheckCircle size={14} color="var(--color-success)" />
              </button>
            )}
            <button className="btn btn-sm btn-ghost" onClick={() => setExpanded(v => !v)}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
              {incident.description}
            </p>

            {protocol ? (
              <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  🤖 AI Response Protocol
                </div>
                {protocol.split('\n').filter(Boolean).map((line, i) => <div key={i}>{line}</div>)}
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={fetchProtocol} disabled={loadingProtocol}>
                {loadingProtocol ? '⏳ Generating...' : '🤖 Get AI Protocol'}
              </button>
            )}

            <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
              {(['assigned', 'in-progress', 'resolved'] as Incident['status'][]).map(s => (
                <button
                  key={s}
                  className={`btn btn-sm ${incident.status === s ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => updateIncidentStatus(incident.id, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function IncidentBoard() {
  const { incidents } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const filtered = incidents.filter(i =>
    filter === 'all' ? true :
    filter === 'open' ? i.status !== 'resolved' :
    i.status === 'resolved'
  );

  const counts = {
    open: incidents.filter(i => i.status === 'open').length,
    inProgress: incidents.filter(i => i.status === 'in-progress' || i.status === 'assigned').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {[
          { label: 'Open', count: counts.open, color: 'var(--color-danger)' },
          { label: 'In Progress', count: counts.inProgress, color: 'var(--color-warning)' },
          { label: 'Resolved', count: counts.resolved, color: 'var(--color-success)' },
        ].map(s => (
          <div key={s.label} className="kpi-card" style={{ '--kpi-color': s.color } as React.CSSProperties}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.count}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {(['all', 'open', 'resolved'] as const).map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${incidents.length})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
          <CheckCircle size={32} style={{ margin: '0 auto var(--space-3)' }} />
          No incidents in this category
        </div>
      )}

      {filtered.map(incident => (
        <IncidentRow key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
