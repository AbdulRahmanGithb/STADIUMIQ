import React, { useState } from 'react';
import { IncidentBoard } from '../components/operations/IncidentBoard';
import { IncidentForm } from '../components/operations/IncidentForm';
import { useAppStore } from '../store/appStore';
import { CrowdHeatmap } from '../components/crowd/CrowdHeatmap';

const STAFF_MEMBERS = [
  { id: 's1', name: 'Maria Santos', role: 'Crowd Steward', zone: 'North Concourse', status: 'on-duty' },
  { id: 's2', name: 'James Park', role: 'Security Officer', zone: 'East Gate', status: 'on-duty' },
  { id: 's3', name: 'Aisha Okonkwo', role: 'Medical First Aid', zone: 'Medical Station Alpha', status: 'on-duty' },
  { id: 's4', name: 'Carlos Rivera', role: 'Technical Support', zone: 'Gate B', status: 'on-duty' },
  { id: 's5', name: 'Sophie Müller', role: 'Fan Liaison', zone: 'South Concourse', status: 'break' },
  { id: 's6', name: 'Raj Patel', role: 'Transport Coordinator', zone: 'Shuttle Hub', status: 'on-duty' },
];

export default function OperationsPage() {
  const { addIncident } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  function reportQuickIncident(type: string) {
    addIncident({
      id: `inc-${Date.now()}`,
      title: type === 'medical' ? 'Medical Assistance Required' : type === 'crowd' ? 'Crowd Density Alert' : 'Security Incident',
      description: `Quick report — ${type} incident requires immediate attention.`,
      severity: 'high',
      status: 'open',
      category: type as 'medical' | 'crowd' | 'security',
      location: 'Pending assignment',
      zoneId: 'z1',
      reportedAt: Date.now(),
    });
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🛡️ Staff Operations Center</h1>
        <p>Incident management, staff deployment, and crowd control coordination</p>
      </div>

      {/* Quick report buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button className="btn btn-danger" onClick={() => reportQuickIncident('medical')}>
          🏥 Medical Emergency
        </button>
        <button className="btn btn-danger" onClick={() => reportQuickIncident('security')}>
          🛡️ Security Incident
        </button>
        <button className="btn btn-danger" onClick={() => reportQuickIncident('crowd')}>
          👥 Crowd Alert
        </button>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel Report' : '📝 Detailed Report'}
        </button>
        <button className="btn btn-ghost" onClick={() => alert('Opening PA announcement system...')}>📻 Broadcast PA</button>
        <button className="btn btn-ghost" onClick={() => alert('Generating shift handover report...')}>📋 Shift Handover</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {showForm && (
          <IncidentForm onSuccess={() => setShowForm(false)} />
        )}

        {/* Incident board */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚨 Incident Management</div>
            <span className="badge badge-danger">AI-Assisted</span>
          </div>
          <IncidentBoard />
        </div>

        {/* Staff deployment */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">👷 Staff Deployment</div>
            <span className="badge badge-success">{STAFF_MEMBERS.filter(s => s.status === 'on-duty').length} On Duty</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {STAFF_MEMBERS.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{s.role}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{s.zone}</td>
                    <td>
                      <span className={`badge ${s.status === 'on-duty' ? 'badge-success' : 'badge-warning'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => alert(`Dispatching ${s.name} to new assignment...`)}>Dispatch</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>🤖 AI Staffing Insight:</span>{' '}
            <span style={{ color: 'var(--color-text-muted)' }}>
              Zone 7 (Food Court) density at 91% — recommend reassigning 2 stewards from South Concourse.
              East Gate congestion rising — pre-position 1 additional security officer by 18:45.
            </span>
          </div>
        </div>

        {/* Live crowd */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Live Crowd Overview</div>
          </div>
          <CrowdHeatmap />
        </div>
      </div>
    </div>
  );
}
