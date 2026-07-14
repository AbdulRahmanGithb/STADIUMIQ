import React, { useEffect, useState } from 'react';
import { ShuttleRoute } from '../../types';
import { crowdSimulator } from '../../services/crowdSimulator';
import { useAppStore } from '../../store/appStore';
import { Bus, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';

function formatMinutes(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return 'Departing...';
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${m}m ${s}s`;
}

function CapacityBar({ value }: { value: number }) {
  const color = value >= 85 ? 'var(--color-danger)' : value >= 65 ? 'var(--color-warning)' : 'var(--color-success)';
  return (
    <div style={{ flex: 1 }}>
      <div className="transport-capacity-bar">
        <div className="progress-fill" style={{ width: `${value}%`, background: color, height: '100%' }} />
      </div>
      <div style={{ fontSize: '0.7rem', color, fontWeight: 600, marginTop: 2 }}>{value}% full</div>
    </div>
  );
}

export function TransportBoard() {
  const [shuttles, setShuttles] = useState<ShuttleRoute[]>(crowdSimulator.getCurrentShuttles());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = crowdSimulator.onShuttleUpdate(setShuttles);
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => { unsub(); clearInterval(timer); };
  }, []);

  const sorted = [...shuttles].sort((a, b) => a.nextDeparture - b.nextDeparture);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Bus size={20} color="var(--color-primary-light)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Shuttle Departures</h3>
        <div className="live-dot" style={{ marginLeft: 'auto' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Updates every 15s</span>
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
          Loading shuttle data...
        </div>
      )}

      {sorted.map(shuttle => (
        <div key={shuttle.id} className="transport-row">
          <div>
            <div className="transport-time">{formatMinutes(shuttle.nextDeparture)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {shuttle.status === 'on-time'
                ? <><CheckCircle size={10} color="var(--color-success)" /> On Time</>
                : <><AlertTriangle size={10} color="var(--color-warning)" /> +{shuttle.delay}m delay</>
              }
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{shuttle.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {shuttle.from} → {shuttle.to}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Every {shuttle.frequency} min · {shuttle.capacity} seats
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <Users size={12} /> {Math.round(shuttle.currentLoad / 100 * shuttle.capacity)} / {shuttle.capacity}
            </div>
            <CapacityBar value={shuttle.currentLoad} />
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => alert(`Booking shuttle to ${r.destination}...`)}>Book</button>
        </div>
      ))}

      <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>🤖 AI Transport Advisory</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Based on current attendance ({Math.round((crowdSimulator.getCurrentCrowdData()?.totalAttendance || 50000) / 82500 * 100)}% capacity) and historical post-match patterns,
          I recommend departing via <strong style={{ color: 'var(--color-text)' }}>Route 2 (Secaucus)</strong> for fastest exit.
          Route 3 to Times Square is at high capacity — consider waiting 20 minutes post-match.
        </p>
      </div>
    </div>
  );
}
