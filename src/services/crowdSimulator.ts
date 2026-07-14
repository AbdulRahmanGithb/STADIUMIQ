import { CrowdData, Zone, Incident, ShuttleRoute, SustainabilityMetrics, AIAlert } from '../types';

type Listener<T> = (data: T) => void;

class CrowdSimulator {
  private crowdListeners: Listener<CrowdData>[] = [];
  private incidentListeners: Listener<Incident>[] = [];
  private shuttleListeners: Listener<ShuttleRoute[]>[] = [];
  private sustainabilityListeners: Listener<SustainabilityMetrics>[] = [];
  private alertListeners: Listener<AIAlert>[] = [];

  private intervals: ReturnType<typeof setInterval>[] = [];
  private baseTime = Date.now();
  private tickCount = 0;

  private zones: Zone[] = [
    { id: 'z1', name: 'North Concourse', level: 1, capacity: 8000, density: 42, alertLevel: 'normal', x: 120, y: 60, width: 200, height: 60 },
    { id: 'z2', name: 'South Concourse', level: 1, capacity: 8000, density: 55, alertLevel: 'normal', x: 120, y: 300, width: 200, height: 60 },
    { id: 'z3', name: 'East Gate Area', level: 1, capacity: 5000, density: 78, alertLevel: 'warning', x: 340, y: 160, width: 80, height: 100 },
    { id: 'z4', name: 'West Gate Area', level: 1, capacity: 5000, density: 31, alertLevel: 'normal', x: 20, y: 160, width: 80, height: 100 },
    { id: 'z5', name: 'Lower Bowl - Sec 100s', level: 2, capacity: 20000, density: 88, alertLevel: 'warning', x: 140, y: 130, width: 160, height: 100 },
    { id: 'z6', name: 'Upper Deck - Sec 200s', level: 3, capacity: 15000, density: 65, alertLevel: 'normal', x: 100, y: 100, width: 240, height: 160 },
    { id: 'z7', name: 'Food Court - Level 1', level: 1, capacity: 3000, density: 91, alertLevel: 'critical', x: 160, y: 245, width: 120, height: 50 },
    { id: 'z8', name: 'VIP/Club Level', level: 2, capacity: 4000, density: 45, alertLevel: 'normal', x: 165, y: 185, width: 110, height: 40 },
    { id: 'z9', name: 'Parking Zone P1-P3', level: 0, capacity: 12000, density: 67, alertLevel: 'normal', x: 20, y: 20, width: 400, height: 30 },
    { id: 'z10', name: 'Medical Station Alpha', level: 1, capacity: 200, density: 15, alertLevel: 'normal', x: 20, y: 270, width: 90, height: 40 },
  ];

  private shuttles: ShuttleRoute[] = [
    { id: 's1', name: 'Route 1 - Newark Penn', from: 'Stadium', to: 'Newark Penn Station', frequency: 15, capacity: 80, currentLoad: 60, nextDeparture: Date.now() + 8 * 60000, status: 'on-time', delay: 0 },
    { id: 's2', name: 'Route 2 - Secaucus Jct', from: 'Stadium', to: 'Secaucus Junction', frequency: 10, capacity: 80, currentLoad: 45, nextDeparture: Date.now() + 3 * 60000, status: 'on-time', delay: 0 },
    { id: 's3', name: 'Route 3 - Times Square', from: 'Stadium', to: 'Times Square / Port Authority', frequency: 20, capacity: 55, currentLoad: 90, nextDeparture: Date.now() + 2 * 60000, status: 'delayed', delay: 5 },
    { id: 's4', name: 'Route 4 - Accessible', from: 'North Gate', to: 'Accessibility Hub', frequency: 10, capacity: 20, currentLoad: 30, nextDeparture: Date.now() + 5 * 60000, status: 'on-time', delay: 0 },
  ];

  private sustainability: SustainabilityMetrics = {
    energyUsed: 12400, energyTarget: 18000,
    waterUsed: 48000, waterTarget: 60000,
    wasteGenerated: 3200, wasteRecycled: 2100,
    carbonFootprint: 42.5, carbonTarget: 50,
    recyclingRate: 65.6, renewableEnergy: 67.2,
  };

  private incidentPool: Omit<Incident, 'id' | 'reportedAt' | 'status' | 'aiProtocol'>[] = [
    { title: 'Fan Assistance Required', description: 'Fan in distress near Section 114, possible heat exhaustion.', severity: 'medium', category: 'medical', location: 'Section 114, Lower Bowl', zoneId: 'z5' },
    { title: 'Crowd Density Alert', description: 'Food Court Level 1 exceeded 90% capacity. Queue extending into main concourse.', severity: 'high', category: 'crowd', location: 'Food Court - Level 1', zoneId: 'z7' },
    { title: 'Gate B Scanner Malfunction', description: 'Ticket scanner at Gate B, Lane 3 is offline. Single-lane processing.', severity: 'medium', category: 'technical', location: 'Gate B - North', zoneId: 'z1' },
    { title: 'Unauthorized Entry Attempt', description: 'Security flagged individual at Gate E attempting entry with invalid credentials.', severity: 'high', category: 'security', location: 'Gate E - East', zoneId: 'z3' },
    { title: 'Spill - Slip Hazard', description: 'Large beverage spill on main concourse near restrooms Section 220.', severity: 'low', category: 'other', location: 'Main Concourse - Level 2', zoneId: 'z6' },
  ];

  private alertPool: Omit<AIAlert, 'id' | 'timestamp' | 'dismissed'>[] = [
    { message: '🔴 Food Court Zone 7 at 91% capacity — AI recommends redirecting fans to Gates B and F kiosks', type: 'danger', zone: 'Food Court' },
    { message: '⚠️ East Gate congestion rising — recommend opening Gate C overflow in next 10 minutes', type: 'warning', zone: 'East Gate' },
    { message: '🚌 Route 3 shuttle at 90% load — AI suggests increasing frequency by 50%', type: 'warning', zone: 'Transport Hub' },
    { message: '✅ Lower Bowl entry complete — all fans seated, kick-off conditions met', type: 'success' },
    { message: 'ℹ️ Weather advisory: Light rain forecast at 21:30. Suggest PA announcement for fans with outdoor access.', type: 'info' },
  ];

  start() {
    // Crowd updates every 5s
    const crowdInterval = setInterval(() => {
      this.tickCount++;
      this.updateZones();
      const data = this.generateCrowdData();
      this.crowdListeners.forEach(l => l(data));
    }, 5000);

    // Shuttle updates every 15s
    const shuttleInterval = setInterval(() => {
      this.updateShuttles();
      this.shuttleListeners.forEach(l => l([...this.shuttles]));
    }, 15000);

    // Sustainability every 30s
    const sustainInterval = setInterval(() => {
      this.updateSustainability();
      this.sustainabilityListeners.forEach(l => l({ ...this.sustainability }));
    }, 30000);

    // Random incidents every 45–90s
    const incidentInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        const inc = this.generateIncident();
        this.incidentListeners.forEach(l => l(inc));
      }
    }, 45000);

    // AI alerts every 20s
    const alertInterval = setInterval(() => {
      if (Math.random() < 0.5) {
        const alert = this.generateAlert();
        this.alertListeners.forEach(l => l(alert));
      }
    }, 20000);

    this.intervals = [crowdInterval, shuttleInterval, sustainInterval, incidentInterval, alertInterval];

    // Emit initial data
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
      const delta = (Math.random() - 0.45) * 4;
      let density = Math.max(5, Math.min(98, zone.density + delta));

      // Simulate pre-match build-up
      if (this.tickCount < 20) density = Math.min(density + 0.5, 95);

      const alertLevel =
        density >= 90 ? 'critical' :
        density >= 75 ? 'warning' :
        density >= 60 ? 'watch' : 'normal';

      return { ...zone, density: Math.round(density), alertLevel };
    });
  }

  private generateCrowdData(): CrowdData {
    const totalDensity = this.zones.reduce((acc, z) => acc + (z.density / 100) * z.capacity, 0);
    const totalCapacity = this.zones.reduce((acc, z) => acc + z.capacity, 0);
    const bottlenecks = this.zones.filter(z => z.alertLevel === 'critical' || z.alertLevel === 'warning').map(z => z.name);

    return {
      timestamp: Date.now(),
      totalAttendance: Math.round(totalDensity),
      capacity: totalCapacity,
      zones: [...this.zones],
      entryRate: Math.round(120 + Math.random() * 80),
      exitRate: Math.round(20 + Math.random() * 30),
      bottlenecks,
    };
  }

  private updateShuttles() {
    this.shuttles = this.shuttles.map(s => {
      const loadDelta = (Math.random() - 0.4) * 10;
      const load = Math.max(10, Math.min(100, s.currentLoad + loadDelta));
      const nextDep = s.nextDeparture - Date.now() < 0
        ? Date.now() + s.frequency * 60000
        : s.nextDeparture;
      const delay = Math.random() < 0.15 ? Math.round(Math.random() * 8) : 0;
      return {
        ...s,
        currentLoad: Math.round(load),
        nextDeparture: nextDep,
        status: delay > 0 ? 'delayed' : 'on-time',
        delay,
      };
    });
  }

  private updateSustainability() {
    this.sustainability = {
      ...this.sustainability,
      energyUsed: Math.min(this.sustainability.energyTarget, this.sustainability.energyUsed + 80 + Math.random() * 40),
      waterUsed: Math.min(this.sustainability.waterTarget, this.sustainability.waterUsed + 300 + Math.random() * 100),
      wasteGenerated: this.sustainability.wasteGenerated + 20 + Math.random() * 10,
      wasteRecycled: this.sustainability.wasteRecycled + 12 + Math.random() * 8,
      carbonFootprint: Math.min(this.sustainability.carbonTarget, this.sustainability.carbonFootprint + 0.2),
    };
    const totalWaste = this.sustainability.wasteGenerated;
    const recycled = this.sustainability.wasteRecycled;
    this.sustainability.recyclingRate = Math.round((recycled / totalWaste) * 100);
  }

  private generateIncident(): Incident {
    const template = this.incidentPool[Math.floor(Math.random() * this.incidentPool.length)];
    return {
      ...template,
      id: `inc-${Date.now()}`,
      status: 'open',
      reportedAt: Date.now(),
    };
  }

  private generateAlert(): AIAlert {
    const template = this.alertPool[Math.floor(Math.random() * this.alertPool.length)];
    return {
      ...template,
      id: `alert-${Date.now()}`,
      timestamp: Date.now(),
      dismissed: false,
    };
  }

  // Subscription methods
  onCrowdUpdate(fn: Listener<CrowdData>) { this.crowdListeners.push(fn); return () => { this.crowdListeners = this.crowdListeners.filter(l => l !== fn); }; }
  onIncident(fn: Listener<Incident>) { this.incidentListeners.push(fn); return () => { this.incidentListeners = this.incidentListeners.filter(l => l !== fn); }; }
  onShuttleUpdate(fn: Listener<ShuttleRoute[]>) { this.shuttleListeners.push(fn); return () => { this.shuttleListeners = this.shuttleListeners.filter(l => l !== fn); }; }
  onSustainabilityUpdate(fn: Listener<SustainabilityMetrics>) { this.sustainabilityListeners.push(fn); return () => { this.sustainabilityListeners = this.sustainabilityListeners.filter(l => l !== fn); }; }
  onAlert(fn: Listener<AIAlert>) { this.alertListeners.push(fn); return () => { this.alertListeners = this.alertListeners.filter(l => l !== fn); }; }

  // One-time getters
  getCurrentCrowdData(): CrowdData { return this.generateCrowdData(); }
  getCurrentShuttles(): ShuttleRoute[] { return [...this.shuttles]; }
  getCurrentSustainability(): SustainabilityMetrics { return { ...this.sustainability }; }
}

export const crowdSimulator = new CrowdSimulator();
