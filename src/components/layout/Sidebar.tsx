import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Users, Bus, Leaf, ShieldAlert,
  HandHelping, BarChart3, Accessibility, Cpu, Trophy
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['fan', 'staff', 'organizer', 'volunteer'] },
  { path: '/navigation', icon: Map, label: 'Navigation', roles: ['fan', 'volunteer'] },
  { path: '/crowd', icon: Users, label: 'Crowd Intelligence', roles: ['staff', 'organizer'] },
  { path: '/transport', icon: Bus, label: 'Transport Hub', roles: ['fan', 'staff', 'organizer', 'volunteer'] },
  { path: '/accessibility', icon: Accessibility, label: 'Accessibility', roles: ['fan', 'volunteer', 'staff'] },
  { path: '/sustainability', icon: Leaf, label: 'Sustainability', roles: ['organizer', 'staff'] },
  { path: '/operations', icon: ShieldAlert, label: 'Operations', roles: ['staff', 'organizer'] },
  { path: '/volunteer', icon: HandHelping, label: 'Volunteer Portal', roles: ['volunteer', 'organizer'] },
  { path: '/organizer', icon: BarChart3, label: 'Command Center', roles: ['organizer'] },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, alerts } = useAppStore();

  const activeAlerts = alerts.filter(a => !a.dismissed && a.type === 'danger').length;
  const filtered = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Trophy size={20} color="white" />
        </div>
        <div>
          <h2>StadiumIQ</h2>
          <span>FIFA World Cup 2026</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-nav">
          {filtered.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isBadge = item.path === '/operations' && activeAlerts > 0;
            return (
              <button
                key={item.path}
                className={`sidebar-link${isActive ? ' active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={18} className="nav-icon" />
                {item.label}
                {isBadge && (
                  <span className="badge badge-danger">{activeAlerts}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <div className="live-dot" />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Live Operations</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Cpu size={14} color="var(--color-primary-light)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)' }}>Powered by Gemini AI</span>
        </div>
      </div>
    </aside>
  );
}
