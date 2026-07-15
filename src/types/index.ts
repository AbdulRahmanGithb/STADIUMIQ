// ── Shared TypeScript Types for FanSetu AI ─────────────────
// FanSetu AI — Fan Bridge AI for FIFA World Cup 2026

export type UserRole = 'fan' | 'staff' | 'organizer' | 'volunteer';

export type Language =
  | 'en' | 'es' | 'fr' | 'ar' | 'pt' | 'de' | 'zh' | 'ja' | 'hi' | 'ur';

export interface Stadium {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  capacity: number;
  lat: number;
  lng: number;
  timezone: string;
  imageUrl?: string;
}

export interface Zone {
  id: string;
  name: string;
  level: number;
  capacity: number;
  density: number; // 0-100
  alertLevel: 'normal' | 'watch' | 'warning' | 'critical';
  x: number;
  y: number;
  width: number;
  height: number;
  description?: string;
  entryRate?: number;
  exitRate?: number;
}

export interface CrowdData {
  timestamp: number;
  totalAttendance: number;
  capacity: number;
  zones: Zone[];
  entryRate: number;  // fans per minute entering
  exitRate: number;   // fans per minute exiting
  bottlenecks: string[];
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'assigned' | 'in-progress' | 'resolved';
export type IncidentCategory = 'medical' | 'security' | 'crowd' | 'technical' | 'fire' | 'other';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  location: string;
  zoneId: string;
  reportedAt: number;
  assignedTo?: string;
  aiProtocol?: string;
  resolvedAt?: number;
}

/** Data shape for the incident submission form (FR-7) */
export interface IncidentFormData {
  title: string;
  description: string;
  severity: IncidentSeverity;
  category: IncidentCategory;
  location: string;
  zoneId: string;
}

export interface ShuttleRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  frequency: number; // minutes
  capacity: number;
  currentLoad: number; // 0-100
  nextDeparture: number; // relative ms from now
  status: 'on-time' | 'delayed' | 'cancelled';
  delay: number; // minutes
}

/** Extended transit option from transitOptions.json (SRS §6.3) */
export interface TransitOption {
  id: string;
  type: 'shuttle' | 'train' | 'rideshare' | 'bus';
  name: string;
  from: string;
  to: string;
  frequency: number; // minutes between departures, 0 = on-demand
  capacity: number;
  currentLoad: number; // 0-100 percent full
  nextDeparture: number; // ms from now (relative offset)
  status: 'on-time' | 'delayed' | 'cancelled';
  delay: number; // minutes
  estimatedMinutes: number;
  pickupZone: string;
  price: string;
  icon: string;
  /** Availability score (0–100) — computed by rankTransitOptions() */
  availabilityScore?: number;
}

export interface Amenity {
  id: string;
  name: string;
  type: 'food' | 'restroom' | 'medical' | 'security' | 'accessibility' | 'info' | 'shop';
  level: number;
  section: string;
  waitMinutes?: number;
  isOpen: boolean;
  x: number;
  y: number;
  zoneId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  language?: string;
}

export interface SustainabilityMetrics {
  energyUsed: number;        // kWh
  energyTarget: number;
  waterUsed: number;         // liters
  waterTarget: number;
  wasteGenerated: number;    // kg
  wasteRecycled: number;
  carbonFootprint: number;   // tonnes CO2
  carbonTarget: number;
  recyclingRate: number;     // %
  renewableEnergy: number;   // %
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  zone: string;
  status: 'on-duty' | 'break' | 'off-duty';
  shiftStart: number;
  shiftEnd: number;
  tasksCompleted: number;
}

export interface MatchDay {
  id: string;
  homeTeam: string;
  homeTeamCode: string;
  awayTeam: string;
  awayTeamCode: string;
  kickoff: number;
  stadium: string;
  group?: string;
  round: string;
  expectedAttendance: number;
}

export interface AIAlert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  zone?: string;
  timestamp: number;
  dismissed: boolean;
}

/** Volunteer task for the Volunteer Hub (FR-10) */
export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  zone: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueTime?: number;
}
