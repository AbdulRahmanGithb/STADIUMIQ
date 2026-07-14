import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CrowdData } from '../../types';
import { crowdSimulator } from '../../services/crowdSimulator';
import { Users, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';

const DENSITY_BG = (d: number) =>
  d >= 90 ? 'rgba(239,68,68,0.12)' :
  d >= 75 ? 'rgba(245,158,11,0.12)' :
  d >= 55 ? 'rgba(14,165,233,0.12)' :
  'rgba(34,197,94,0.12)';

const DENSITY_BORDER = (d: number) =>
  d >= 90 ? 'rgba(239,68,68,0.35)' :
  d >= 75 ? 'rgba(245,158,11,0.35)' :
  d >= 55 ? 'rgba(14,165,233,0.35)' :
  'rgba(34,197,94,0.35)';

const DENSITY_TEXT = (d: number) =>
  d >= 90 ? 'var(--color-danger)' :
  d >= 75 ? 'var(--color-warning)' :
  d >= 55 ? 'var(--color-info)' :
  'var(--color-success)';

export function CrowdHeatmap() {
  const [crowdData, setCrowdData] = useState<CrowdData | null>(crowdSimulator.getCurrentCrowdData());
  const [history, setHistory] = useState<{ time: string; attendance: number; entry: number; exit: number }[]>([]);

  useEffect(() => {
    const addHistory = (data: CrowdData) => {
      setCrowdData(data);
      setHistory(prev => {
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const next = [...prev, { time: t, attendance: data.totalAttendance, entry: data.entryRate, exit: data.exitRate }];
        return next.slice(-20);
      });
    };
    const unsub = crowdSimulator.onCrowdUpdate(addHistory);
    return unsub;
  }, []);

  if (!crowdData) return <div className="skeleton" style={{ height: 200 }} />;

  const pct = Math.round((crowdData.totalAttendance / crowdData.capacity) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
        {[
          { icon: Users, label: 'Total Attendance', value: crowdData.totalAttendance.toLocaleString(), color: 'var(--color-primary)' },
          { icon: TrendingUp, label: 'Entry Rate', value: `${crowdData.entryRate}/min`, color: 'var(--color-success)' },
          { icon: ArrowUpRight, label: 'Exit Rate', value: `${crowdData.exitRate}/min`, color: 'var(--color-warning)' },
          { icon: AlertTriangle, label: 'Bottlenecks', value: crowdData.bottlenecks.length.toString(), color: crowdData.bottlenecks.length > 0 ? 'var(--color-danger)' : 'var(--color-success)' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.color } as React.CSSProperties}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize: '1.4rem', color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Overall capacity bar */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Stadium Capacity</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: DENSITY_TEXT(pct) }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: DENSITY_TEXT(pct) }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <span>{crowdData.totalAttendance.toLocaleString()} fans</span>
          <span>Capacity: {crowdData.capacity.toLocaleString()}</span>
        </div>
      </div>

      {/* Zone heatmap */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><AlertTriangle size={16} /> Zone Density Heatmap</div>
          <div className="live-dot" />
        </div>
        <div className="heatmap-grid">
          {crowdData.zones.map(zone => (
            <div
              key={zone.id}
              className="heatmap-zone"
              style={{ background: DENSITY_BG(zone.density), borderColor: DENSITY_BORDER(zone.density) }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{zone.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Level {zone.level} · Capacity {zone.capacity.toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: DENSITY_TEXT(zone.density) }}>
                  {zone.density}%
                </div>
                <div style={{ fontSize: '0.7rem', color: DENSITY_TEXT(zone.density), fontWeight: 600 }}>
                  {zone.alertLevel.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Area chart */}
      {history.length > 2 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Attendance Flow (Live)</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="entryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.75rem' }}
                labelStyle={{ color: 'var(--color-text-muted)' }}
              />
              <Area type="monotone" dataKey="entry" stroke="var(--color-success)" strokeWidth={2} fill="url(#entryGrad)" name="Entry/min" />
              <Area type="monotone" dataKey="exit" stroke="var(--color-warning)" strokeWidth={2} fill="url(#exitGrad)" name="Exit/min" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottleneck alert */}
      {crowdData.bottlenecks.length > 0 && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} />
          <div className="alert-content">
            <div className="alert-title">⚠️ AI Bottleneck Alert</div>
            <div className="alert-body">
              Congestion detected: <strong>{crowdData.bottlenecks.join(', ')}</strong>.
              AI recommends dispatching additional crowd stewards and opening overflow exits.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
