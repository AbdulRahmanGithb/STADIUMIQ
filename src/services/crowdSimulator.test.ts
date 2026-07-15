import { describe, it, expect } from 'vitest';
import { computeRiskScore, rankTransitOptions } from './crowdSimulator';
import { Zone, TransitOption } from '../types';

describe('Risk Score Algorithm (FR-6.3)', () => {
  it('returns 0 for empty zones', () => {
    expect(computeRiskScore([])).toBe(0);
  });

  it('calculates weighted average density', () => {
    const zones: Zone[] = [
      { id: '1', capacity: 1000, density: 50, alertLevel: 'normal', name: 'Z1', level: 1, x: 0, y: 0, width: 10, height: 10, description: '', entryRate: 10, exitRate: 10 },
      { id: '2', capacity: 1000, density: 100, alertLevel: 'critical', name: 'Z2', level: 1, x: 0, y: 0, width: 10, height: 10, description: '', entryRate: 10, exitRate: 10 }
    ];
    // avg = 75. 1 critical zone = +8 penalty.
    // 75 + 8 = 83
    expect(computeRiskScore(zones)).toBe(83);
  });

  it('caps at 100', () => {
    const zones: Zone[] = [
      { id: '1', capacity: 1000, density: 100, alertLevel: 'critical', name: 'Z1', level: 1, x: 0, y: 0, width: 10, height: 10, description: '', entryRate: 10, exitRate: 10 },
      { id: '2', capacity: 1000, density: 100, alertLevel: 'critical', name: 'Z2', level: 1, x: 0, y: 0, width: 10, height: 10, description: '', entryRate: 10, exitRate: 10 }
    ];
    // avg = 100. 2 critical zones = +16 penalty. Total = 116. Capped at 100.
    expect(computeRiskScore(zones)).toBe(100);
  });
});

describe('Transit Ranking Algorithm (FR-5.2)', () => {
  it('ranks by availability score', () => {
    const options: TransitOption[] = [
      { id: '1', type: 'bus', name: 'Bus', route: 'A', from: 'Stadium', to: 'City', currentLoad: 90, nextDeparture: 1000, capacity: 100, status: 'delayed', delay: 10, estimatedMinutes: 20, pickupZone: 'Zone A', price: '$5', icon: '🚌' } as any,
      { id: '2', type: 'train', name: 'Train', route: 'B', from: 'Stadium', to: 'City', currentLoad: 50, nextDeparture: 300000, capacity: 200, status: 'on-time', delay: 0, estimatedMinutes: 15, pickupZone: 'Zone B', price: '$10', icon: '🚆' } as any
    ];
    
    // Opt 1 score: (100-90)*0.5 + 30 (soon) + 0 (delayed) = 5 + 30 = 35
    // Opt 2 score: (100-50)*0.5 + 30 (soon) + 20 (on-time) = 25 + 30 + 20 = 75
    
    const ranked = rankTransitOptions(options);
    expect(ranked[0].id).toBe('2');
    expect(ranked[1].id).toBe('1');
    expect(ranked[0].availabilityScore).toBe(75);
    expect(ranked[1].availabilityScore).toBe(35);
  });
});
