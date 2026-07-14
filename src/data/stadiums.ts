import { Stadium, MatchDay } from '../types';

export const STADIUMS: Stadium[] = [
  { id: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', country: 'USA', capacity: 82500, lat: 40.8135, lng: -74.0745, timezone: 'America/New_York' },
  { id: 'sofi', name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', country: 'USA', capacity: 70240, lat: 33.9535, lng: -118.3392, timezone: 'America/Los_Angeles' },
  { id: 'atandt', name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'USA', capacity: 80000, lat: 32.7479, lng: -97.0945, timezone: 'America/Chicago' },
  { id: 'cesarbh', name: 'Estadio Azteca', city: 'Mexico City', state: 'CDMX', country: 'Mexico', capacity: 87523, lat: 19.3029, lng: -99.1505, timezone: 'America/Mexico_City' },
  { id: 'bmo', name: 'BMO Field', city: 'Toronto', state: 'ON', country: 'Canada', capacity: 45000, lat: 43.6333, lng: -79.4186, timezone: 'America/Toronto' },
  { id: 'bcplace', name: 'BC Place', city: 'Vancouver', state: 'BC', country: 'Canada', capacity: 54500, lat: 49.2769, lng: -123.1118, timezone: 'America/Vancouver' },
  { id: 'arrowhead', name: 'Arrowhead Stadium', city: 'Kansas City', state: 'MO', country: 'USA', capacity: 76416, lat: 39.0490, lng: -94.4839, timezone: 'America/Chicago' },
  { id: 'gillette', name: 'Gillette Stadium', city: 'Foxborough', state: 'MA', country: 'USA', capacity: 65878, lat: 42.0909, lng: -71.2643, timezone: 'America/New_York' },
  { id: 'lincoln', name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', country: 'USA', capacity: 69796, lat: 39.9008, lng: -75.1675, timezone: 'America/New_York' },
  { id: 'levis', name: "Levi's Stadium", city: 'Santa Clara', state: 'CA', country: 'USA', capacity: 68500, lat: 37.4033, lng: -121.9694, timezone: 'America/Los_Angeles' },
  { id: 'mercedes', name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'GA', country: 'USA', capacity: 71000, lat: 33.7554, lng: -84.4010, timezone: 'America/New_York' },
  { id: 'nrg', name: 'NRG Stadium', city: 'Houston', state: 'TX', country: 'USA', capacity: 72220, lat: 29.6847, lng: -95.4107, timezone: 'America/Chicago' },
  { id: 'seattle', name: 'Lumen Field', city: 'Seattle', state: 'WA', country: 'USA', capacity: 68740, lat: 47.5952, lng: -122.3316, timezone: 'America/Los_Angeles' },
  { id: 'dallas', name: 'Cotton Bowl Stadium', city: 'Dallas', state: 'TX', country: 'USA', capacity: 92100, lat: 32.7773, lng: -96.7578, timezone: 'America/Chicago' },
  { id: 'miami', name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', country: 'USA', capacity: 64767, lat: 25.9580, lng: -80.2389, timezone: 'America/New_York' },
  { id: 'guadalajara', name: 'Estadio Akron', city: 'Guadalajara', state: 'Jalisco', country: 'Mexico', capacity: 49850, lat: 20.6736, lng: -103.3985, timezone: 'America/Mexico_City' },
];

export const TODAY_MATCH: MatchDay = {
  id: 'm001',
  homeTeam: 'Brazil',
  homeTeamCode: 'BRA',
  awayTeam: 'Argentina',
  awayTeamCode: 'ARG',
  kickoff: Date.now() + 2 * 60 * 60 * 1000, // 2h from now
  stadium: 'MetLife Stadium',
  round: 'Group Stage - Group C',
  expectedAttendance: 80000,
};
