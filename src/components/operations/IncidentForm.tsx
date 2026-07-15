import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { IncidentFormData, IncidentSeverity, IncidentCategory } from '../../types';
import { ShieldAlert, Send } from 'lucide-react';
import { sanitizeInput, analyzeIncident } from '../../services/geminiService';

export function IncidentForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addIncident } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<IncidentFormData>({
    title: '',
    description: '',
    severity: 'low',
    category: 'other',
    location: '',
    zoneId: 'z1'
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation (FR-7.2)
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Input sanitization (NFR-2.2, FR-7.5)
      const sanitizedData = {
        ...formData,
        title: sanitizeInput(formData.title, 100),
        description: sanitizeInput(formData.description, 500),
        location: sanitizeInput(formData.location, 100),
      };

      const newIncident = {
        ...sanitizedData,
        id: `inc-${Date.now()}`,
        status: 'open' as const,
        reportedAt: Date.now(),
      };

      // Add to store first so it shows up immediately
      addIncident(newIncident);

      // Background task to get AI protocol (FR-7.4)
      analyzeIncident(newIncident as unknown as Record<string, unknown>).then(protocol => {
        useAppStore.getState().updateIncidentStatus(newIncident.id, 'assigned'); // simulate automatic assignment
        // Hack: directly update protocol in store since we don't have a specific action for it, 
        // we'll dispatch an update with the same status but it forces a re-render.
        // Actually, we need to add aiProtocol to the update logic, let's just push a fresh incident.
        // Or rather, we can update the store directly.
        useAppStore.setState(s => ({
          incidents: s.incidents.map(i => i.id === newIncident.id ? { ...i, aiProtocol: protocol } : i)
        }));
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        severity: 'low',
        category: 'other',
        location: '',
        zoneId: 'z1'
      });
      
      if (onSuccess) onSuccess();
      
    } catch (err) {
      setError('Failed to submit incident. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-header">
        <div className="card-title"><ShieldAlert size={18} /> Report New Incident</div>
      </div>
      
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="alert-body">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Incident Title *</label>
            <input 
              type="text" 
              className="ai-input" 
              style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="E.g. Spill in Concourse"
              maxLength={100}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Location *</label>
            <input 
              type="text" 
              className="ai-input" 
              style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="E.g. Near Section 114"
              maxLength={100}
              required
            />
          </div>
        </div>

        <div className="grid-2">
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Category</label>
            <select 
              className="ai-input" 
              style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as IncidentCategory})}
            >
              <option value="medical">Medical</option>
              <option value="security">Security</option>
              <option value="crowd">Crowd Control</option>
              <option value="technical">Technical / Facility</option>
              <option value="fire">Fire / Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Severity</label>
            <select 
              className="ai-input" 
              style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}
              value={formData.severity}
              onChange={e => setFormData({...formData, severity: e.target.value as IncidentSeverity})}
            >
              <option value="low">Low (Non-urgent)</option>
              <option value="medium">Medium (Requires attention)</option>
              <option value="high">High (Urgent response needed)</option>
              <option value="critical">Critical (Immediate danger)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Description * (Max 500 chars)</label>
          <textarea 
            className="ai-input" 
            style={{ width: '100%', borderRadius: 'var(--radius-sm)', minHeight: '80px', resize: 'vertical' }}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the incident in detail..."
            maxLength={500}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? 'Submitting...' : <><Send size={16} /> Submit & Request AI Protocol</>}
          </button>
        </div>
      </form>
    </div>
  );
}
