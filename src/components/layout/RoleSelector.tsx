import React from 'react';
import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types';

const ROLES: { id: UserRole; label: string; emoji: string }[] = [
  { id: 'fan', label: 'Fan', emoji: '🏟️' },
  { id: 'staff', label: 'Staff', emoji: '👷' },
  { id: 'organizer', label: 'Organizer', emoji: '📋' },
  { id: 'volunteer', label: 'Volunteer', emoji: '🙋' },
];

export function RoleSelector() {
  const { role, setRole } = useAppStore();
  return (
    <div className="role-selector">
      {ROLES.map(r => (
        <button
          key={r.id}
          className={`role-btn${role === r.id ? ' active' : ''}`}
          onClick={() => setRole(r.id)}
          title={r.label}
        >
          {r.emoji} {r.label}
        </button>
      ))}
    </div>
  );
}
