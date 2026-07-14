import React from 'react';
import { CrowdHeatmap } from '../components/crowd/CrowdHeatmap';
import { StadiumMap } from '../components/navigation/StadiumMap';

export default function CrowdPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>👥 Crowd Intelligence</h1>
        <p>Real-time crowd density monitoring, AI predictions, and bottleneck alerts</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <CrowdHeatmap />
        <div className="card">
          <div className="card-header">
            <div className="card-title">🗺️ Live Crowd Map</div>
          </div>
          <StadiumMap />
        </div>
      </div>
    </div>
  );
}
