import React, { useState } from 'react';
import { generateMatchBriefing } from '../services/geminiService';
import { TODAY_MATCH } from '../data/stadiums';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { FileText, Cpu, TrendingUp } from 'lucide-react';

const ATTENDANCE_HISTORY = [
  { match: 'M1\nGER-JPN', attendance: 74200, nps: 82 },
  { match: 'M2\nBRA-MOR', attendance: 80100, nps: 88 },
  { match: 'M3\nFRA-ARG', attendance: 78500, nps: 79 },
  { match: 'M4\nESP-ENG', attendance: 81200, nps: 91 },
  { match: 'Today\nBRA-ARG', attendance: 80000, nps: 0 },
];

const KPI_PROJECTIONS = [
  { hour: '14:00', fans: 8000 },
  { hour: '15:00', fans: 22000 },
  { hour: '16:00', fans: 45000 },
  { hour: '17:00', fans: 61000 },
  { hour: '18:00', fans: 72000 },
  { hour: '19:00', fans: 79000 },
  { hour: '20:00', fans: 80000 },
];

export default function OrganizerPage() {
  const [briefing, setBriefing] = useState('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  async function handleGenerateBriefing() {
    setLoadingBriefing(true);
    setBriefing('');
    const result = await generateMatchBriefing('MetLife Stadium', TODAY_MATCH as unknown as Record<string, unknown>);
    setBriefing(result);
    setLoadingBriefing(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>📋 Organizer Command Center</h1>
        <p>FIFA World Cup 2026 — Strategic operations overview and AI decision support</p>
      </div>

      {/* Top KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Match Revenue', value: '$14.2M', change: '+8%', pos: true, color: 'var(--color-accent)' },
          { label: 'Avg NPS Score', value: '85/100', change: '+3pts', pos: true, color: 'var(--color-success)' },
          { label: 'Active Staff', value: '1,840', change: '97% deployed', pos: true, color: 'var(--color-primary)' },
          { label: 'Volunteer Hours', value: '4,200h', change: 'Today', pos: true, color: 'var(--color-info)' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.color } as React.CSSProperties}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className={`kpi-change ${k.pos ? 'positive' : 'negative'}`}>
              <TrendingUp size={12} /> {k.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Attendance history */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Attendance by Match</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ATTENDANCE_HISTORY} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="match" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickFormatter={v => `${Math.round(v / 1000)}K`} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.75rem' }}
                formatter={(v) => [Number(v).toLocaleString(), 'Attendance']}
              />
              <Bar dataKey="attendance" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fan arrival projection */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Today — Fan Arrival Projection</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={KPI_PROJECTIONS} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickFormatter={v => `${Math.round(v / 1000)}K`} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.75rem' }}
                formatter={(v) => [Number(v).toLocaleString(), 'Fans']}
              />
              <Line type="monotone" dataKey="fans" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ fill: 'var(--color-accent)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Briefing Generator */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <div className="card-title"><Cpu size={16} color="var(--color-primary-light)" /> AI Match-Day Briefing Generator</div>
          <span className="badge badge-primary">Gemini Pro</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.7 }}>
          Generate a comprehensive AI-powered match-day briefing including crowd predictions, staffing recommendations, sustainability status, and key operational alerts.
        </p>
        <button
          className="btn btn-accent btn-lg"
          onClick={handleGenerateBriefing}
          disabled={loadingBriefing}
          id="generate-briefing-btn"
        >
          {loadingBriefing ? (
            <><span className="animate-spin">⏳</span> Generating Briefing...</>
          ) : (
            <><FileText size={18} /> Generate AI Briefing</>
          )}
        </button>

        {briefing && (
          <div style={{
            marginTop: 'var(--space-5)', padding: 'var(--space-5)',
            background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)', animation: 'fadeIn 0.4s ease',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Cpu size={14} /> AI-Generated Briefing
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {briefing}
            </div>
          </div>
        )}
      </div>

      {/* Venue comparison */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>📍 Multi-Venue Status Today</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Stadium</th>
                <th>Match</th>
                <th>Capacity</th>
                <th>Incidents</th>
                <th>Sustainability</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { stadium: 'MetLife Stadium', match: 'BRA vs ARG', cap: '97%', inc: 2, sus: '72/100', status: 'Active' },
                { stadium: 'SoFi Stadium', match: 'GER vs ESP', cap: '94%', inc: 0, sus: '85/100', status: 'Active' },
                { stadium: 'AT&T Stadium', match: 'FRA vs POR', cap: '88%', inc: 1, sus: '68/100', status: 'Active' },
                { stadium: 'Estadio Azteca', match: 'MEX vs USA', cap: '100%', inc: 3, sus: '71/100', status: 'Active' },
              ].map(row => (
                <tr key={row.stadium}>
                  <td style={{ fontWeight: 600 }}>{row.stadium}</td>
                  <td>{row.match}</td>
                  <td><span className={`badge ${parseInt(row.cap) > 95 ? 'badge-warning' : 'badge-success'}`}>{row.cap}</span></td>
                  <td><span className={`badge ${row.inc > 1 ? 'badge-warning' : row.inc > 0 ? 'badge-info' : 'badge-success'}`}>{row.inc}</span></td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{row.sus}</td>
                  <td><span className="badge badge-success">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
