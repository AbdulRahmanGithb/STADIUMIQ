/**
 * crowdSimulator.ts — FanSetu AI
 * MOCK DATA — simulates real-time stadium crowd, shuttle, and sustainability data.
 * All data is randomly generated and refreshed on timers. Not real-time.
 * 
 * Exports:
 *  - crowdSimulator: singleton simulation engine (subscribe to updates)
 *  - computeRiskScore(): crowd risk algorithm (SRS FR-6.3, NFR-6.1)
 *  - rankTransitOptions(): transit ranking algorithm (SRS FR-5.2, NFR-6.1)
 */
import { CrowdData, Zone, Incident, ShuttleRoute, SustainabilityMetrics, AIAlert, TransitOption } from '../types';

type Listener<T> = (data: T) => void;

// ── Risk Score Algorithm (SRS FR-6.3) ─────────────────────────────────────────
/** Computes a 0–100 crowd risk score across all zones.
 *  Weighted average density + penalties for critical/warning zones.
 *  MOCK DATA — based on simulated zone densities.
 */
export function computeRiskScore(zones: Zone[]): number {
  if (!zones.length) return 0;
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const weightedDensity = zones.reduce((sum, z) => sum + z.density * z.capacity, 0);
  const avgDensity = totalCapacity > 0 ? weightedDensity / totalCapacity : 0;
  // Non-linear penalty for high-alert zones
  const criticalPenalty = zones.filter(z => z.alertLevel === 'critical').length * 8;
  const warningPenalty = zones.filter(z => z.alertLevel === 'warning').length * 3;
  return Math.min(100, Math.round(avgDensity + criticalPenalty + warningPenalty));
}

// ── Transit Ranking Algorithm (SRS FR-5.2) ────────────────────────────────────
/** Ranks transit options by availability score (higher = better choice).
 *  Score = capacity_available(50%) + soon_departure_bonus(30%) + on_time_bonus(20%).
 *  MOCK DATA — based on simulated loads and departure times.
 */
export function rankTransitOptions(options: TransitOption[]): TransitOption[] {
  const now = Date.now();
  return [...options]
    .map(o => {
      const msUntil = o.nextDeparture; // relative ms from now
      const availabilityScore =
        (100 - o.currentLoad) * 0.5 +
        (msUntil > 0 && msUntil < 600000 ? 30 : 0) + // bonus if departing within 10 min
        (o.status === 'on-time' ? 20 : 0);
      return { ...o, availabilityScore: Math.round(availabilityScore) };
    })
    .sort((a, b) => (b.availabilityScore ?? 0) - (a.availabilityScore ?? 0));
}

class CrowdSimulator {
  private crowdListeners: Listener<CrowdData>[] = [];
  private incidentListeners: Listener<Incident>[] = [];
  private shuttleListeners: Listener<ShuttleRoute[]>[] = [];
  private sustainabilityListeners: Listener<SustainabilityMetrics>[] = [];
  private alertListeners: Listener<AIAlert>[] = [];

  private intervals: ReturnType<typeof setInterval>[] = [];
  private tickCount = 0;

  // MOCK DATA — initial zone state
  private zones: Zone[] = [
    { id: 'z1', name: 'Gate A — North', level: 1, capacity: 5000, density: 45, alertLevel: 'normal', x: 40, y: 5, width: 20, height: 12, description: 'Main north entrance', entryRate: 42, exitRate: 5 },
    { id: 'z2', name: 'Gate B — Northeast', level: 1, capacity: 4500, density: 38, alertLevel: 'normal', x: 72, y: 15, width: 16, height: 12, description: 'Northeast entry', entryRate: 35, exitRate: 3 },
    { id: 'z3', name: 'Gate C — East', level: 1, capacity: 5200, density: 82, alertLevel: 'warning', x: 83, y: 40, width: 12, height: 16, description: 'East entrance — high congestion', entryRate: 88, exitRate: 8 },
    { id: 'z4', name: 'Gate D — Southeast', level: 1, capacity: 4800, density: 23, alertLevel: 'normal', x: 72, y: 68, width: 16, height: 12, description: 'AI recommended — least congested', entryRate: 20, exitRate: 2 },
    { id: 'z5', name: 'Gate E — South', level: 1, capacity: 5000, density: 55, alertLevel: 'normal', x: 40, y: 83, width: 20, height: 12, description: 'South entrance, shuttle drop-off', entryRate: 51, exitRate: 5 },
    { id: 'z6', name: 'Gate F — West', level: 1, capacity: 5500, density: 91, alertLevel: 'critical', x: 5, y: 40, width: 12, height: 16, description: 'CRITICAL — overflow active', entryRate: 95, exitRate: 10 },
    { id: 'z7', name: 'Lower Bowl — Sec 100-115', level: 2, capacity: 18000, density: 72, alertLevel: 'watch', x: 25, y: 25, width: 50, height: 50, description: 'Main lower seating bowl', entryRate: 120, exitRate: 15 },
    { id: 'z8', name: 'Club Level — East', level: 3, capacity: 4000, density: 48, alertLevel: 'normal', x: 65, y: 30, width: 15, height: 15, description: 'Premium club level', entryRate: 30, exitRate: 5 },
    { id: 'z9', name: 'Upper Deck — North', level: 4, capacity: 8000, density: 61, alertLevel: 'watch', x: 30, y: 10, width: 40, height: 12, description: 'Upper deck north', entryRate: 65, exitRate: 8 },
    { id: 'z10', name: 'Food Court — Level 1', level: 1, capacity: 2000, density: 94, alertLevel: 'critical', x: 20, y: 45, width: 15, height: 10, description: 'CRITICAL — AI redirect active', entryRate: 98, exitRate: 20 },
  ];

  // MOCK DATA — initial shuttle state
  private shuttles: ShuttleRoute[] = [
    { id: 's1', name: 'Route 1 — Newark Penn', from: 'Stadium', to: 'Newark Penn Station', frequency: 15, capacity: 80, currentLoad: 60, nextDeparture: Date.now() + 8 * 60000, status: 'on-time', delay: 0 },
    { id: 's2', name: 'Route 2 — Secaucus Jct', from: 'Stadium', to: 'Secaucus Junction', frequency: 10, capacity: 80, currentLoad: 35, nextDeparture: Date.now() + 3 * 60000, status: 'on-time', delay: 0 },
    { id: 's3', name: 'Route 3 — Times Square', from: 'Stadium', to: 'Times Square / Port Auth', frequency: 20, capacity: 55, currentLoad: 91, nextDeparture: Date.now() + 12 * 60000, status: 'delayed', delay: 5 },
    { id: 's4', name: 'Route 4 — Hoboken', from: 'Stadium', to: 'Hoboken Terminal', frequency: 10, capacity: 55, currentLoad: 48, nextDeparture: Date.now() + 6 * 60000, status: 'on-time', delay: 0 },
  ];

  // MOCK DATA — sustainability metrics
  private sustainability: SustainabilityMetrics = {
    energyUsed: 12400, energyTarget: 18000,
    waterUsed: 48000, waterTarget: 60000,
    wasteGenerated: 3200, wasteRecycled: 2100,
    carbonFootprint: 42.5, carbonTarget: 50,
    recyclingRate: 65.6, renewableEnergy: 67.2,
  };

  // MOCK DATA — incident templates
  private incidentPool: Omit<Incident, 'id' | 'reportedAt' | 'status' | 'aiProtocol'>[] = [
    { title: 'Fan Assistance Required', description: 'Fan in distress near Section 114 — possible heat exhaustion.', severity: 'medium', category: 'medical', location: 'Section 114, Lower Bowl', zoneId: 'z7' },
    { title: 'Crowd Density Alert', description: 'Food Court Level 1 exceeded 90% capacity. Queue spilling onto main concourse.', severity: 'high', category: 'crowd', location: 'Food Court — Level 1', zoneId: 'z10' },
    { title: 'Gate Scanner Malfunction', description: 'Ticket scanner at Gate B, Lane 3 offline. Single-lane processing causing delays.', severity: 'medium', category: 'technical', location: 'Gate B — Northeast', zoneId: 'z2' },
    { title: 'Unauthorized Entry Attempt', description: 'Security flagged individual at Gate E attempting entry with invalid credentials.', severity: 'high', category: 'security', location: 'Gate E — South', zoneId: 'z5' },
    { title: 'Slip Hazard — Concourse', description: 'Beverage spill on main concourse near restrooms, Upper Deck Section 220.', severity: 'low', category: 'other', location: 'Upper Deck Concourse — Level 4', zoneId: 'z9' },
  ];

  // MOCK DATA — AI alert templates
  private alertPool: Omit<AIAlert, 'id' | 'timestamp' | 'dismissed'>[] = [
    { message: '🔴 Food Court Level 1 at 94% — AI redirect: fans to Gate A North kiosks', type: 'danger', zone: 'Food Court' },
    { message: '⚠️ Gate F (West) congestion at 91% — recommend opening Gate D overflow', type: 'warning', zone: 'Gate F' },
    { message: '🚌 Route 3 shuttle at 91% load — AI suggests +30% frequency from 17:00', type: 'warning', zone: 'Transport Hub' },
    { message: '✅ Lower Bowl entry complete — kick-off conditions met', type: 'success' },
    { message: 'ℹ️ Weather: Light rain forecast 21:30 — PA advisory recommended', type: 'info' },
    { message: '⚠️ Gate C (East) queue extending past concourse — deploy 2 stewards', type: 'warning', zone: 'Gate C' },
  ];

  start() {
    // Crowd updates every 5s (SRS FR-6.5)
    const crowdInterval = setInterval(() => {
      this.tickCount++;
      this.updateZones();
      const data = this.generateCrowdData();
      this.crowdListeners.forEach(l => l(data));
    }, 5000);

    // Shuttle updates every 15s (SRS FR-5 — MOCK)
    const shuttleInterval = setInterval(() => {
      this.updateShuttles();
      this.shuttleListeners.forEach(l => l([...this.shuttles]));
    }, 15000);

    // Sustainability every 30s (MOCK)
    const sustainInterval = setInterval(() => {
      this.updateSustainability();
      this.sustainabilityListeners.forEach(l => l({ ...this.sustainability }));
    }, 30000);

    // Random incidents every ~60s (MOCK)
    const incidentInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        const inc = this.generateIncident();
        this.incidentListeners.forEach(l => l(inc));
      }
    }, 60000);

    // AI alerts every 25s (MOCK)
    const alertInterval = setInterval(() => {
      if (Math.random() < 0.45) {
        const alert = this.generateAlert();
        this.alertListeners.forEach(l => l(alert));
      }
    }, 25000);

    this.intervals = [crowdInterval, shuttleInterval, sustainInterval, incidentInterval, alertInterval];

    // Emit initial data immediately
    setTimeout(() => {
      this.crowdListeners.forEach(l => l(this.generateCrowdData()));
      this.shuttleListeners.forEach(l => l([...this.shuttles]));
      this.sustainabilityListeners.forEach(l => l({ ...this.sustainability }));
    }, 100);
  }

  stop() {
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];
  }

  private updateZones() {
    this.zones = this.zones.map(zone => {
      const delta = (Math.random() - 0.45) * 5; // slight upward bias before match
      let density = Math.max(5, Math.min(98, zone.density + delta));
      if (this.tickCount < 20) density = Math.min(density + 0.3, 95); // pre-match build-up

      const alertLevel =
        density >= 90 ? 'critical' :
        density >= 75 ? 'warning' :
        density >= 60 ? 'watch' : 'normal';

      return { ...zone, density: Math.round(density), alertLevel };
    });
  }

  private generateCrowdData(): CrowdData {
    const totalAttendance = Math.round(
      this.zones.reduce((acc, z) => acc + (z.density / 100) * z.capacity, 0)
    );
    const totalCapacity = this.zones.reduce((acc, z) => acc + z.capacity, 0);
    const bottlenecks = this.zones
      .filter(z => z.alertLevel === 'critical' || z.alertLevel === 'warning')
      .map(z => z.name);

    return {
      timestamp: Date.now(),
      totalAttendance,
      capacity: totalCapacity,
      zones: [...this.zones],
      entryRate: Math.round(120 + Math.random() * 80),
      exitRate: Math.round(10 + Math.random() * 20),
      bottlenecks,
    };
  }

  private updateShuttles() {
    this.shuttles = this.shuttles.map(s => {
      const loadDelta = (Math.random() - 0.4) * 8;
      const load = Math.max(10, Math.min(100, s.currentLoad + loadDelta));
      const nextDep = s.nextDeparture - Date.now() < 0
        ? Date.now() + s.frequency * 60000
        : s.nextDeparture;
      const delay = Math.random() < 0.12 ? Math.round(Math.random() * 7) : 0;
      return { ...s, currentLoad: Math.round(load), nextDeparture: nextDep, status: delay > 0 ? 'delayed' : 'on-time', delay };
    });
  }

  private updateSustainability() {
    this.sustainability = {
      ...this.sustainability,
      energyUsed: Math.min(this.sustainability.energyTarget, this.sustainability.energyUsed + 60 + Math.random() * 40),
      waterUsed: Math.min(this.sustainability.waterTarget, this.sustainability.waterUsed + 250 + Math.random() * 100),
      wasteGenerated: this.sustainability.wasteGenerated + 15 + Math.random() * 10,
      wasteRecycled: this.sustainability.wasteRecycled + 9 + Math.random() * 7,
      carbonFootprint: Math.min(this.sustainability.carbonTarget, this.sustainability.carbonFootprint + 0.15),
    };
    this.sustainability.recyclingRate = Math.round(
      (this.sustainability.wasteRecycled / this.sustainability.wasteGenerated) * 100
    );
  }

  private generateIncident(): Incident {
    const template = this.incidentPool[Math.floor(Math.random() * this.incidentPool.length)];
    return { ...template, id: `inc-${Date.now()}`, status: 'open', reportedAt: Date.now() };
  }

  private generateAlert(): AIAlert {
    const template = this.alertPool[Math.floor(Math.random() * this.alertPool.length)];
    return { ...template, id: `alert-${Date.now()}`, timestamp: Date.now(), dismissed: false };
  }

  // ── Subscription API ────────────────────────────────────────────────────────
  onCrowdUpdate(fn: Listener<CrowdData>) { this.crowdListeners.push(fn); return () => { this.crowdListeners = this.crowdListeners.filter(l => l !== fn); }; }
  onIncident(fn: Listener<Incident>) { this.incidentListeners.push(fn); return () => { this.incidentListeners = this.incidentListeners.filter(l => l !== fn); }; }
  onShuttleUpdate(fn: Listener<ShuttleRoute[]>) { this.shuttleListeners.push(fn); return () => { this.shuttleListeners = this.shuttleListeners.filter(l => l !== fn); }; }
  onSustainabilityUpdate(fn: Listener<SustainabilityMetrics>) { this.sustainabilityListeners.push(fn); return () => { this.sustainabilityListeners = this.sustainabilityListeners.filter(l => l !== fn); }; }
  onAlert(fn: Listener<AIAlert>) { this.alertListeners.push(fn); return () => { this.alertListeners = this.alertListeners.filter(l => l !== fn); }; }

  // ── One-time Getters ────────────────────────────────────────────────────────
  getCurrentCrowdData(): CrowdData { return this.generateCrowdData(); }
  getCurrentShuttles(): ShuttleRoute[] { return [...this.shuttles]; }
  getCurrentSustainability(): SustainabilityMetrics { return { ...this.sustainability }; }
  getCurrentZones(): Zone[] { return [...this.zones]; }
  getCurrentRiskScore(): number { return computeRiskScore(this.zones); }
}

export const crowdSimulator = new CrowdSimulator();
