import React from 'react';
import { SustainabilityDashboard } from '../components/sustainability/SustainabilityDashboard';

export default function SustainabilityPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🌱 Sustainability Dashboard</h1>
        <p>FIFA World Cup 2026 Green Stadium Initiative — Real-time environmental metrics</p>
      </div>
      <SustainabilityDashboard />
    </div>
  );
}
