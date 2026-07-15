/**
 * appStore.ts — FanSetu AI
 * Global Zustand store. Single source of truth for role, language, incidents, alerts, crowd data.
 * Language preference is persisted to sessionStorage (FR-1.3).
 */
import { create } from 'zustand';
import { UserRole, Language, CrowdData, Incident, ShuttleRoute, SustainabilityMetrics, AIAlert, VolunteerTask } from '../types';

interface AppState {
  role: UserRole;
  hasOnboarded: boolean;
  language: Language;
  selectedStadium: string;
  sidebarOpen: boolean;
  crowdData: CrowdData | null;
  incidents: Incident[];
  shuttles: ShuttleRoute[];
  sustainability: SustainabilityMetrics | null;
  alerts: AIAlert[];
  volunteerTasks: VolunteerTask[];
  textSizeLevel: 0 | 1 | 2; // 0=normal, 1=large, 2=x-large
  highContrast: boolean;

  setRole: (role: UserRole) => void;
  setOnboarded: (val: boolean) => void;
  setLanguage: (lang: Language) => void;
  setSelectedStadium: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setCrowdData: (data: CrowdData) => void;
  addIncident: (incident: Incident) => void;
  updateIncidentStatus: (id: string, status: Incident['status']) => void;
  setShuttles: (shuttles: ShuttleRoute[]) => void;
  setSustainability: (data: SustainabilityMetrics) => void;
  addAlert: (alert: AIAlert) => void;
  dismissAlert: (id: string) => void;
  markTaskComplete: (id: string) => void;
  setTextSizeLevel: (level: 0 | 1 | 2) => void;
  toggleHighContrast: () => void;
}

// Restore language from sessionStorage if present (FR-1.3)
const savedLang = (sessionStorage.getItem('fansetu_lang') as Language) || 'en';

export const useAppStore = create<AppState>((set) => ({
  role: 'fan',
  hasOnboarded: false,
  language: savedLang,
  selectedStadium: 'metlife',
  sidebarOpen: true,
  crowdData: null,
  textSizeLevel: 0,
  highContrast: false,

  // Seed incidents (simulates Firestore initial state — MOCK DATA)
  incidents: [
    {
      id: 'inc-001',
      title: 'Food Court Overcrowding',
      description: 'Zone 10 (Food Court Level 1) has exceeded 94% capacity. Fan queue extending into main concourse and blocking emergency access.',
      severity: 'high',
      status: 'in-progress',
      category: 'crowd',
      location: 'Food Court — Level 1',
      zoneId: 'z10',
      reportedAt: Date.now() - 12 * 60000,
      assignedTo: 'Team Alpha',
      aiProtocol:
        '1. Open additional food kiosks at Gate A (North) immediately.\n' +
        '2. PA redirect: "Fans, please use food outlets at Gate A and Gate E."\n' +
        '3. Deploy 3 crowd stewards to create single-file lanes.\n' +
        '4. Monitor density every 5 minutes — escalate if exceeds 97%.',
    },
    {
      id: 'inc-002',
      title: 'Gate B Scanner Offline',
      description: 'Ticket validation scanner at Gate B (Northeast), Lane 3 is offline. Causing slow processing and minor queue buildup.',
      severity: 'medium',
      status: 'assigned',
      category: 'technical',
      location: 'Gate B — Northeast Entrance',
      zoneId: 'z2',
      reportedAt: Date.now() - 25 * 60000,
      assignedTo: 'Technical Team',
      aiProtocol:
        '1. Dispatch tech team (ETA 5 min — pager sent).\n' +
        '2. Open Gate A Lane 2 as overflow immediately.\n' +
        '3. Manual ticket check as interim — instruct stewards.\n' +
        '4. Log for vendor follow-up after event.',
    },
    {
      id: 'inc-003',
      title: 'Fan Medical Assistance',
      description: 'Fan reported feeling unwell near Section 114. Possible dehydration. Medical unit requested.',
      severity: 'medium',
      status: 'resolved',
      category: 'medical',
      location: 'Section 114 — Lower Bowl',
      zoneId: 'z7',
      reportedAt: Date.now() - 45 * 60000,
      assignedTo: 'Medical Unit 3',
      resolvedAt: Date.now() - 30 * 60000,
      aiProtocol:
        '1. Clear 3m radius around patient immediately.\n' +
        '2. Nearest medical unit dispatched — ETA 2 min.\n' +
        '3. Provide water and shade while waiting.\n' +
        '4. Assess for hospital transport — no hospital needed.',
    },
    {
      id: 'inc-004',
      title: 'Gate F Crowd Surge',
      description: 'Gate F (West) reached 91% capacity. Risk of crowd crush. AI alert triggered.',
      severity: 'critical',
      status: 'open',
      category: 'crowd',
      location: 'Gate F — West Entrance',
      zoneId: 'z6',
      reportedAt: Date.now() - 5 * 60000,
    },
  ],

  shuttles: [],
  sustainability: null,

  // Seed AI alerts (MOCK DATA)
  alerts: [
    {
      id: 'alert-init-1',
      message: '🔴 Food Court Level 1 at 94% — redirect fans to Gate A North kiosks',
      type: 'danger',
      zone: 'Food Court',
      timestamp: Date.now() - 3 * 60000,
      dismissed: false,
    },
    {
      id: 'alert-init-2',
      message: '🚌 Route 3 shuttle at 91% load — AI recommends +30% frequency',
      type: 'warning',
      zone: 'Transport',
      timestamp: Date.now() - 8 * 60000,
      dismissed: false,
    },
    {
      id: 'alert-init-3',
      message: '⚠️ Gate F (West) at CRITICAL 91% — overflow to Gate D recommended',
      type: 'danger',
      zone: 'Gate F',
      timestamp: Date.now() - 2 * 60000,
      dismissed: false,
    },
  ],

  // Seed volunteer tasks (MOCK DATA)
  volunteerTasks: [
    { id: 'vt-1', title: 'Greet fans at Gate A North', description: 'Welcome fans and provide wristbands. Direct wheelchair users to accessibility hub.', zone: 'Gate A', priority: 'high', completed: false, dueTime: Date.now() + 30 * 60000 },
    { id: 'vt-2', title: 'Monitor Food Court Level 1', description: 'Crowd density is critical. Help redirect fans to Gate A kiosks. Use hand signals.', zone: 'Food Court', priority: 'high', completed: false },
    { id: 'vt-3', title: 'Assist shuttle boarding Zone B', description: 'Manage boarding queue for Route 2 (Secaucus). Ensure no rushing.', zone: 'Zone B South Lot', priority: 'medium', completed: false },
    { id: 'vt-4', title: 'Distribute multilingual guides', description: 'Hand out stadium guides in EN/ES/FR/AR to arriving fans at Gate E.', zone: 'Gate E South', priority: 'medium', completed: true },
    { id: 'vt-5', title: 'Brief shift handover notes', description: 'Complete digital handover form before shift ends at 20:00.', zone: 'Volunteer HQ', priority: 'low', completed: false, dueTime: Date.now() + 120 * 60000 },
  ],

  // ── Actions ─────────────────────────────────────────────────────────────────
  setRole: (role) => set({ role }),
  setOnboarded: (hasOnboarded) => set({ hasOnboarded }),
  setLanguage: (language) => {
    sessionStorage.setItem('fansetu_lang', language); // persist (FR-1.3)
    set({ language });
  },
  setSelectedStadium: (selectedStadium) => set({ selectedStadium }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setCrowdData: (crowdData) => set({ crowdData }),

  addIncident: (incident) => set(s => ({ incidents: [incident, ...s.incidents].slice(0, 50) })),
  updateIncidentStatus: (id, status) =>
    set(s => ({
      incidents: s.incidents.map(i =>
        i.id === id
          ? { ...i, status, resolvedAt: status === 'resolved' ? Date.now() : i.resolvedAt }
          : i
      ),
    })),

  setShuttles: (shuttles) => set({ shuttles }),
  setSustainability: (sustainability) => set({ sustainability }),
  addAlert: (alert) => set(s => ({ alerts: [alert, ...s.alerts].slice(0, 20) })),
  dismissAlert: (id) => set(s => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, dismissed: true } : a) })),

  markTaskComplete: (id) =>
    set(s => ({
      volunteerTasks: s.volunteerTasks.map(t => t.id === id ? { ...t, completed: true } : t),
    })),

  setTextSizeLevel: (textSizeLevel) => set({ textSizeLevel }),
  toggleHighContrast: () => set(s => ({ highContrast: !s.highContrast })),
}));
