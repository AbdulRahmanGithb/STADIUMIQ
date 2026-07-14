import { create } from 'zustand';
import { UserRole, Language, CrowdData, Incident, ShuttleRoute, SustainabilityMetrics, AIAlert } from '../types';

interface AppState {
  role: UserRole;
  language: Language;
  selectedStadium: string;
  sidebarOpen: boolean;
  crowdData: CrowdData | null;
  incidents: Incident[];
  shuttles: ShuttleRoute[];
  sustainability: SustainabilityMetrics | null;
  alerts: AIAlert[];

  setRole: (role: UserRole) => void;
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
}

export const useAppStore = create<AppState>((set) => ({
  role: 'fan',
  language: 'en',
  selectedStadium: 'metlife',
  sidebarOpen: true,
  crowdData: null,
  incidents: [
    {
      id: 'inc-001',
      title: 'Food Court Overcrowding',
      description: 'Zone 7 (Food Court Level 1) has exceeded 90% capacity. Fan queue extending into main concourse.',
      severity: 'high',
      status: 'in-progress',
      category: 'crowd',
      location: 'Food Court - Level 1',
      zoneId: 'z7',
      reportedAt: Date.now() - 12 * 60000,
      assignedTo: 'Team Alpha',
      aiProtocol: '1. Open additional food kiosks at Gate B. 2. Redirect fans via PA system. 3. Deploy 3 crowd stewards. 4. Monitor every 5 minutes.',
    },
    {
      id: 'inc-002',
      title: 'Gate B Scanner Offline',
      description: 'Ticket validation scanner at Gate B Lane 3 is offline. Causing slow processing and minor queue buildup.',
      severity: 'medium',
      status: 'assigned',
      category: 'technical',
      location: 'Gate B - North Entrance',
      zoneId: 'z1',
      reportedAt: Date.now() - 25 * 60000,
      assignedTo: 'Technical Team',
      aiProtocol: '1. Dispatch tech team (ETA 5 min). 2. Open Gate A lane 2 as overflow. 3. Manual ticket check as interim. 4. Log for vendor follow-up.',
    },
    {
      id: 'inc-003',
      title: 'Fan Medical Assistance',
      description: 'Fan reported feeling unwell near Section 114. Possible dehydration. Medical unit requested.',
      severity: 'medium',
      status: 'resolved',
      category: 'medical',
      location: 'Section 114 - Lower Bowl',
      zoneId: 'z5',
      reportedAt: Date.now() - 45 * 60000,
      assignedTo: 'Medical Unit 3',
      resolvedAt: Date.now() - 30 * 60000,
      aiProtocol: '1. Clear 3m radius. 2. Nearest medical unit dispatched. 3. Provide water/shade. 4. Assess for hospital transport.',
    },
  ],
  shuttles: [],
  sustainability: null,
  alerts: [
    {
      id: 'alert-init-1',
      message: '🔴 Food Court Zone 7 at 91% capacity — redirect fans to Gates B & F kiosks',
      type: 'danger',
      zone: 'Food Court',
      timestamp: Date.now() - 3 * 60000,
      dismissed: false,
    },
    {
      id: 'alert-init-2',
      message: '🚌 Route 3 shuttle at 90% load — AI suggests increasing frequency by 50%',
      type: 'warning',
      zone: 'Transport',
      timestamp: Date.now() - 8 * 60000,
      dismissed: false,
    },
  ],

  setRole: (role) => set({ role }),
  setLanguage: (language) => set({ language }),
  setSelectedStadium: (selectedStadium) => set({ selectedStadium }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setCrowdData: (crowdData) => set({ crowdData }),
  addIncident: (incident) => set(s => ({ incidents: [incident, ...s.incidents].slice(0, 50) })),
  updateIncidentStatus: (id, status) => set(s => ({
    incidents: s.incidents.map(i => i.id === id ? { ...i, status, resolvedAt: status === 'resolved' ? Date.now() : undefined } : i)
  })),
  setShuttles: (shuttles) => set({ shuttles }),
  setSustainability: (sustainability) => set({ sustainability }),
  addAlert: (alert) => set(s => ({ alerts: [alert, ...s.alerts].slice(0, 20) })),
  dismissAlert: (id) => set(s => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, dismissed: true } : a) })),
}));
