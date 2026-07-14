import React, { useEffect, useState } from 'react';
import { CrowdData, Zone } from '../../types';
import { crowdSimulator } from '../../services/crowdSimulator';
import { useAppStore } from '../../store/appStore';

const DENSITY_COLOR = (d: number) =>
  d >= 90 ? 'var(--color-density-critical)' :
  d >= 75 ? 'var(--color-density-high)' :
  d >= 55 ? 'var(--color-density-medium)' :
  'var(--color-density-low)';

const DENSITY_OPACITY = (d: number) => 0.15 + (d / 100) * 0.5;

interface StadiumMapProps {
  showAccessibility?: boolean;
  highlightZone?: string;
}

export function StadiumMap({ showAccessibility = false, highlightZone }: StadiumMapProps) {
  const [crowdData, setCrowdData] = useState<CrowdData | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [selectedDest, setSelectedDest] = useState<string>('food');

  useEffect(() => {
    setCrowdData(crowdSimulator.getCurrentCrowdData());
    const unsub = crowdSimulator.onCrowdUpdate(setCrowdData);
    return unsub;
  }, []);

  const zones = crowdData?.zones ?? [];

  const AMENITY_ICONS: Record<string, string> = {
    food: '🍔', restroom: '🚻', medical: '🏥', accessibility: '♿', info: 'ℹ️', shop: '🛍️',
  };
  const DESTINATIONS = [
    { id: 'food', label: 'Food Court', icon: '🍔' },
    { id: 'restroom', label: 'Restrooms', icon: '🚻' },
    { id: 'medical', label: 'Medical', icon: '🏥' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'exit', label: 'Nearest Exit', icon: '🚪' },
  ];

  return (
    <div className="stadium-map-container">
      <div className="stadium-map-controls">
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginRight: 'auto' }}>
          MetLife Stadium — Live Crowd Overlay
        </span>
        {DESTINATIONS.map(d => (
          <button
            key={d.id}
            className={`btn btn-sm${selectedDest === d.id ? ' btn-primary' : ' btn-ghost'}`}
            onClick={() => { setSelectedDest(d.id); setShowRoute(true); }}
          >
            {d.icon} {d.label}
          </button>
        ))}
        <button
          className={`btn btn-sm${!showRoute ? ' btn-primary' : ' btn-ghost'}`}
          onClick={() => setShowRoute(false)}
        >
          Clear Route
        </button>
      </div>

      {/* SVG Map */}
      <div style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
        <svg
          viewBox="0 0 440 380"
          style={{ width: '100%', maxWidth: 700, display: 'block', margin: '0 auto' }}
        >
          {/* Background */}
          <rect width="440" height="380" fill="hsl(222, 47%, 9%)" rx="12" />

          {/* Outer stadium shell */}
          <ellipse cx="220" cy="190" rx="190" ry="160" fill="hsl(222, 40%, 12%)" stroke="hsl(222, 30%, 25%)" strokeWidth="2" />

          {/* Pitch */}
          <ellipse cx="220" cy="190" rx="95" ry="72" fill="hsl(145, 50%, 22%)" stroke="hsl(145, 50%, 35%)" strokeWidth="1.5" />
          <ellipse cx="220" cy="190" rx="95" ry="72" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
          {/* Center circle */}
          <circle cx="220" cy="190" r="20" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="120" x2="220" y2="260" stroke="white" strokeWidth="1" opacity="0.3" />
          {/* Goal boxes */}
          <rect x="190" y="118" width="60" height="16" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
          <rect x="190" y="246" width="60" height="16" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />

          {/* Zone overlays */}
          {zones.map(zone => {
            const isHighlighted = highlightZone === zone.id || selectedZone?.id === zone.id;
            return (
              <g key={zone.id} onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)} style={{ cursor: 'pointer' }}>
                <rect
                  x={zone.x} y={zone.y}
                  width={zone.width} height={zone.height}
                  fill={DENSITY_COLOR(zone.density)}
                  fillOpacity={DENSITY_OPACITY(zone.density)}
                  stroke={isHighlighted ? 'white' : DENSITY_COLOR(zone.density)}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={0.6}
                  rx="4"
                />
                {/* Density label */}
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2 + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="700"
                  opacity="0.9"
                >
                  {Math.round(zone.density)}%
                </text>
              </g>
            );
          })}

          {/* AI Route overlay */}
          {showRoute && (
            <g>
              <path
                d="M 220 340 L 220 295 L 165 245 L 160 200"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth="3"
                strokeDasharray="6 4"
                fill="none"
                opacity="0.9"
              >
                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
              </path>
              <circle cx="220" cy="340" r="6" fill="var(--color-primary)" />
              <text x="230" y="344" fill="var(--color-primary-light)" fontSize="9" fontWeight="600">You</text>
              <circle cx="160" cy="200" r="6" fill="hsl(142, 71%, 45%)" />
              <text x="170" y="204" fill="hsl(142, 71%, 65%)" fontSize="9" fontWeight="600">
                {AMENITY_ICONS[selectedDest]} {DESTINATIONS.find(d => d.id === selectedDest)?.label}
              </text>
            </g>
          )}

          {/* Accessibility route */}
          {showAccessibility && (
            <path
              d="M 20 190 L 60 190 L 90 180 L 130 190"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth="3"
              strokeDasharray="5 3"
              fill="none"
              opacity="0.8"
            />
          )}

          {/* Gate labels */}
          {[
            { label: 'Gate A', x: 220, y: 22 },
            { label: 'Gate B', x: 390, y: 190 },
            { label: 'Gate C', x: 220, y: 360 },
            { label: 'Gate D', x: 35, y: 190 },
          ].map(g => (
            <text key={g.label} x={g.x} y={g.y} textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontWeight="600">
              {g.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Zone detail panel */}
      {selectedZone && (
        <div style={{
          margin: 'var(--space-4)', padding: 'var(--space-4)',
          background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)', animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedZone.name}</h4>
            <span className={`badge badge-${selectedZone.alertLevel === 'critical' ? 'danger' : selectedZone.alertLevel === 'warning' ? 'warning' : 'success'}`}>
              {selectedZone.alertLevel.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Density</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: DENSITY_COLOR(selectedZone.density) }}>
                {selectedZone.density}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Capacity</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedZone.capacity.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>In Zone</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {Math.round(selectedZone.density / 100 * selectedZone.capacity).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 'var(--space-3)' }}>
            <div className="progress-fill" style={{ width: `${selectedZone.density}%`, background: DENSITY_COLOR(selectedZone.density) }} />
          </div>
          {selectedZone.alertLevel !== 'normal' && (
            <div style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              ⚠️ AI recommends re-routing fans via Gate D (currently 31% capacity)
            </div>
          )}
        </div>
      )}

      <div className="zone-legend">
        {[
          { color: 'var(--color-density-low)', label: 'Low (0–55%)' },
          { color: 'var(--color-density-medium)', label: 'Moderate (55–75%)' },
          { color: 'var(--color-density-high)', label: 'High (75–90%)' },
          { color: 'var(--color-density-critical)', label: 'Critical (90%+)' },
        ].map(l => (
          <div key={l.label} className="legend-item">
            <div className="legend-dot" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
