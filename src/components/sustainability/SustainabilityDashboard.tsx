import React, { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SustainabilityMetrics } from '../../types';
import { crowdSimulator } from '../../services/crowdSimulator';
import { Leaf, Zap, Droplets, Trash2, Wind } from 'lucide-react';

function GaugeCard({ label, value, target, unit, icon: Icon, color }: {
  label: string; value: number; target: number; unit: string;
  icon: React.ElementType; color: string;
}) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className="kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="kpi-icon"><Icon size={18} color={color} /></div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: pct > 85 ? 'var(--color-warning)' : 'var(--color-success)' }}>
          {pct}% of target
        </span>
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: '1.5rem', color }}>{value.toLocaleString()}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-text-muted)' }}> {unit}</span></div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 90 ? 'var(--color-danger)' : pct > 75 ? 'var(--color-warning)' : color }} />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Target: {target.toLocaleString()} {unit}</div>
    </div>
  );
}

export function SustainabilityDashboard() {
  const [data, setData] = useState<SustainabilityMetrics | null>(crowdSimulator.getCurrentSustainability());

  useEffect(() => {
    const unsub = crowdSimulator.onSustainabilityUpdate(setData);
    return unsub;
  }, []);

  if (!data) return <div className="skeleton" style={{ height: 300 }} />;

  const recyclingData = [
    { name: 'Recycled', value: data.recyclingRate, color: 'var(--color-success)' },
    { name: 'Landfill', value: 100 - data.recyclingRate, color: 'var(--color-border)' },
  ];

  const energyData = [
    { name: 'Renewable', value: data.renewableEnergy, color: 'var(--color-success)' },
    { name: 'Conventional', value: 100 - data.renewableEnergy, color: 'var(--color-warning)' },
  ];

  const scoreData = [
    { name: 'Energy', score: Math.round((1 - data.energyUsed / data.energyTarget) * 100 + 30), fill: 'var(--color-success)' },
    { name: 'Water', score: Math.round((1 - data.waterUsed / data.waterTarget) * 100 + 25), fill: 'var(--color-info)' },
    { name: 'Waste', score: data.recyclingRate, fill: 'var(--color-accent)' },
    { name: 'Carbon', score: Math.round((1 - data.carbonFootprint / data.carbonTarget) * 100 + 20), fill: 'var(--color-primary)' },
  ].map(d => ({ ...d, score: Math.max(0, Math.min(100, d.score)) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Green Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(59,130,246,0.08))',
        border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
      }}>
        <div style={{ fontSize: '3rem' }}>🌱</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>
            Sustainability Score: 72/100
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            On track for FIFA Green Stadium Certification · {data.renewableEnergy.toFixed(1)}% renewable energy today
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Carbon Footprint</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {data.carbonFootprint.toFixed(1)}t
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>/ {data.carbonTarget}t target</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <GaugeCard label="Energy Used" value={Math.round(data.energyUsed)} target={data.energyTarget} unit="kWh" icon={Zap} color="var(--color-warning)" />
        <GaugeCard label="Water Used" value={Math.round(data.waterUsed)} target={data.waterTarget} unit="L" icon={Droplets} color="var(--color-info)" />
        <GaugeCard label="Waste Generated" value={Math.round(data.wasteGenerated)} target={5000} unit="kg" icon={Trash2} color="var(--color-danger)" />
        <GaugeCard label="Waste Recycled" value={Math.round(data.wasteRecycled)} target={Math.round(data.wasteGenerated)} unit="kg" icon={Leaf} color="var(--color-success)" />
      </div>

      {/* Charts row */}
      <div className="grid-2">
        {/* Recycling pie */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}><Trash2 size={16} /> Recycling Rate</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <PieChart width={120} height={120}>
              <Pie data={recyclingData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                {recyclingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-success)' }}>
                {data.recyclingRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>recycled today</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Target: 80% · Gap: {(80 - data.recyclingRate).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Energy mix */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}><Zap size={16} /> Energy Mix</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <PieChart width={120} height={120}>
              <Pie data={energyData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                {energyData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-success)' }}>
                {data.renewableEnergy.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>renewable energy</div>
              <div style={{ fontSize: '0.75rem', color: data.renewableEnergy >= 70 ? 'var(--color-success)' : 'var(--color-warning)', marginTop: 4 }}>
                {data.renewableEnergy >= 70 ? '✅ On target' : '⚠️ Below 70% target'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category bar chart */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}><Wind size={16} /> Sustainability Scores by Category</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={scoreData} layout="vertical" margin={{ left: 40, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
              formatter={(v) => [`${v}/100`, 'Score']}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {scoreData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Advisor */}
      <div className="alert alert-success">
        <Leaf size={18} />
        <div className="alert-content">
          <div className="alert-title">🤖 AI Sustainability Advisor</div>
          <div className="alert-body">
            Recycling rate is at {data.recyclingRate.toFixed(1)}% — 12.4% short of target.
            AI recommends deploying 5 additional recycling station assistants near Gates A, C, and E.
            Estimated impact: +8% recycling rate. Also consider green shuttle incentive messaging on main screens.
          </div>
        </div>
      </div>
    </div>
  );
}
