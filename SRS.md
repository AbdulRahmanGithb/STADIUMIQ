# FanSetu AI — Software Requirements Specification

**Product**: FanSetu AI  
**Version**: 1.0  
**Date**: 2026-07-15  
**Stack**: React 18 + TypeScript + Vite + Zustand + Gemini API

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for FanSetu AI, a GenAI-powered stadium companion app for FIFA World Cup 2026.

### 1.2 Scope
The system provides a single-page web application with four role-based portals: Fan, Staff, Organizer, Volunteer. All AI features use the Google Gemini API. All stadium/crowd/transit data is mock JSON, clearly labeled.

### 1.3 Definitions
- **Mock data**: Static or timer-refreshed JSON data simulating live feeds; labeled `// MOCK DATA` in code
- **Role context injection**: Including user role and stadium context in every Gemini API prompt
- **Risk score**: A computed 0–100 integer representing crowd danger level across all zones
- **Language fallback**: If Gemini returns non-English when `language === 'en'`, the mock layer returns English

---

## 2. System Overview

```
Browser Client
├── RoleSelector     → sets global UserRole
├── ChatScreen       → FR-2, FR-3
├── NavigateScreen   → FR-4
├── TransitScreen    → FR-5
├── Dashboard        → FR-6, FR-9
├── IncidentForm     → FR-7
├── IncidentBoard    → FR-8
└── VolunteerHub     → FR-10

State Layer (Zustand)
└── appStore.ts → role, language, incidents, alerts, crowdData, shuttles

AI Layer
└── geminiService.ts → sendMessage(), analyzeIncident(), generateMatchBriefing()

Simulation Layer (MOCK — refreshed by timer)
└── crowdSimulator.ts → crowd zones, shuttle loads, risk score
```

---

## 3. Functional Requirements

### FR-1: Role Selection
- **FR-1.1** The app shall display a full-screen role selector on first load (no role selected).
- **FR-1.2** Roles available: `fan`, `staff`, `organizer`, `volunteer`.
- **FR-1.3** Selecting a role shall persist to session storage and route to the dashboard.
- **FR-1.4** The user may switch roles at any time from the top bar.

### FR-2: AI System Instructions (Role-Aware Context)
- **FR-2.1** Every Gemini API call shall include a role-specific system instruction prepended to the prompt.
- **FR-2.2** System instructions per role:
  - `fan`: "You are a helpful FIFA World Cup 2026 fan assistant at MetLife Stadium. Assist with navigation, food, transport, and match-day experience. Respond in the user's language."
  - `staff`: "You are a stadium operations AI. Assist with incident management, crowd control, and operational decision-making. Be concise and actionable."
  - `organizer`: "You are an executive AI assistant for FIFA tournament organizers. Provide strategic insights, KPI summaries, and decision support. Use professional tone."
  - `volunteer`: "You are a FIFA volunteer support assistant. Help with zone assignments, shift tasks, FAQs, and emergency protocols."
- **FR-2.3** The prompt shall include stadium name, match, current crowd density, and timestamp.

### FR-3: Multilingual AI Chat
- **FR-3.1** The AI assistant shall respond in the language selected by the user (10 supported: en, es, fr, ar, pt, de, zh, ja, hi, ur).
- **FR-3.2** If Gemini API is unavailable, the mock response shall be in English regardless of selected language (fallback).
- **FR-3.3** Language greeting shall be displayed when the chat panel is first opened.
- **FR-3.4** Voice input shall be supported via Web Speech API (`SpeechRecognition`).
- **FR-3.5** Conversation history (last 6 messages) shall be included in each Gemini request.

### FR-4: Stadium Navigation
- **FR-4.1** The navigation screen shall display an SVG map of MetLife Stadium zones.
- **FR-4.2** Each zone shall be color-coded by density: green (< 60%), yellow (60–80%), red (> 80%).
- **FR-4.3** The AI shall recommend the least-congested gate for entry/exit.
- **FR-4.4** Clicking a zone shall show zone details: name, density %, alert level, amenities.
- **FR-4.5** A quick-find panel shall list nearest food, restroom, medical, and accessibility points.

### FR-5: Transit & Transport
- **FR-5.1** The transit screen shall load options from `transitOptions.json` (mock).
- **FR-5.2** Options shall be ranked by: (1) capacity available, (2) next departure time, (3) estimated travel time.
- **FR-5.3** Each option shall display: route name, from/to, next departure countdown, capacity bar, status badge.
- **FR-5.4** An AI advisory panel shall recommend the best option based on current crowd data.
- **FR-5.5** A "Book" action shall trigger a toast notification (simulated booking).

### FR-6: Crowd Monitoring
- **FR-6.1** The crowd dashboard shall display a table of all zones with: name, density, alert level, entry/exit rates.
- **FR-6.2** A risk score (0–100) shall be computed and displayed.
- **FR-6.3** Risk score formula: `riskScore = zones.reduce((sum, z) => sum + z.density * z.capacity, 0) / totalCapacity`
- **FR-6.4** If risk score > 75, an AI alert shall be generated and added to the alerts feed.
- **FR-6.5** Crowd data shall be refreshed every 5 seconds by the simulator.

### FR-7: Incident Submission
- **FR-7.1** The incident form shall capture: title, category, severity, location, description.
- **FR-7.2** All fields are required; validation errors shall be shown inline.
- **FR-7.3** On submission, the incident shall be added to the Zustand store (simulating Firestore write).
- **FR-7.4** An AI-generated response protocol shall be fetched and attached to the incident.
- **FR-7.5** Input shall be sanitized: strip HTML tags, trim whitespace, max 500 chars for description.

### FR-8: Incident Board
- **FR-8.1** The operations page shall show all incidents sorted by reportedAt (newest first).
- **FR-8.2** Status filter: all, open, in-progress, resolved.
- **FR-8.3** Severity filter: all, low, medium, high, critical.
- **FR-8.4** Each incident card shall show: title, category, severity badge, status badge, location, time ago, AI protocol (expandable).
- **FR-8.5** Staff can change incident status via inline action buttons.

### FR-9: Organizer Command Center
- **FR-9.1** The organizer page shall display KPI cards: total attendance, active incidents, shuttle load avg, sustainability score.
- **FR-9.2** A radar chart shall show operational health scores (Crowd Flow, Safety, Transport, Sustainability, Fan Experience, Accessibility).
- **FR-9.3** A "Generate Briefing" button shall call `generateMatchBriefing()` and render markdown output.
- **FR-9.4** Sustainability metrics shall be rendered in a Recharts area chart.
- **FR-9.5** NPS / arrival projections chart shall be rendered.

### FR-10: Volunteer Hub
- **FR-10.1** The volunteer page shall display: assigned zone, shift start/end times, task list.
- **FR-10.2** Each task shall have a checkbox; checking it calls `markTaskComplete()` in the store.
- **FR-10.3** Emergency protocols shall be accessible from the volunteer page.
- **FR-10.4** A "Contact Supervisor" action shall display supervisor contact details (mock).

---

## 4. Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1** Initial page load (LCP) shall be < 3 seconds on a 4G connection.
- **NFR-1.2** Crowd simulation updates shall not block the UI (uses `setInterval`, not blocking loops).

### NFR-2: Security & Input Sanitization
- **NFR-2.1** No API keys shall be committed to the repository.
- **NFR-2.2** All user inputs to Gemini shall be sanitized: strip `<`, `>`, `&` HTML entities; trim; limit to 500 chars.
- **NFR-2.3** The `.env` file is listed in `.gitignore`.

### NFR-3: Accessibility
- **NFR-3.1** Color contrast shall meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).
- **NFR-3.2** All interactive elements shall be keyboard-navigable (Tab/Enter/Space).
- **NFR-3.3** A text-size toggle (A- / A+) shall be accessible in the top bar.
- **NFR-3.4** All images and icons shall have descriptive `alt` text or `aria-label`.
- **NFR-3.5** A "Skip to main content" link shall appear on Tab focus.
- **NFR-3.6** A high-contrast mode toggle shall be available in the top bar.

### NFR-4: Repo Size
- **NFR-4.1** The repository (excluding node_modules) shall be < 10 MB.
- **NFR-4.2** `node_modules/`, `dist/`, `.env`, `.firebase/`, `*.log` shall be in `.gitignore`.

### NFR-5: Free Tier Only
- **NFR-5.1** Only free-tier Google services shall be used: Gemini API (Google AI Studio key), Firebase Spark plan.
- **NFR-5.2** No paid APIs or billing-account-required services shall be introduced.

### NFR-6: Testing
- **NFR-6.1** Unit tests shall cover: `computeRiskScore()`, `rankTransitOptions()`, language fallback logic.
- **NFR-6.2** One integration/mock test shall cover the Gemini proxy call (mocked fetch).
- **NFR-6.3** Tests shall use Vitest and run via `npm test`.
- **NFR-6.4** All tests shall pass before final commit.

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (React + Vite)                    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Fan    │  │  Staff   │  │Organizer │  │Volunteer │   │
│  │  Portal  │  │  Portal  │  │  Portal  │  │   Hub    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴─────────────┘         │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │   Zustand App Store   │                      │
│              │  (role, incidents,    │                      │
│              │   crowd, alerts)      │                      │
│              └───────────┬───────────┘                      │
│                          │                                  │
│       ┌──────────────────┼──────────────────┐               │
│       ▼                  ▼                  ▼               │
│  ┌─────────┐    ┌──────────────┐   ┌──────────────┐        │
│  │ Gemini  │    │    Crowd     │   │  Mock JSON   │        │
│  │ Service │    │  Simulator   │   │  Data Files  │        │
│  │(AI chat,│    │ (5s refresh) │   │(stadiumMap,  │        │
│  │briefing,│    └──────────────┘   │ crowdFeed,   │        │
│  │protocol)│                       │transitOptions│        │
│  └────┬────┘                       └──────────────┘        │
└───────┼─────────────────────────────────────────────────────┘
        │  HTTPS
        ▼
┌───────────────┐
│ Google Gemini │
│  API (Flash / │
│   Pro models) │
└───────────────┘
```

---

## 6. Mock Data Schemas (SRS §6)

### 6.1 stadiumMap.json
```json
{
  "stadium": { "id": "metlife", "name": "MetLife Stadium", "capacity": 82500 },
  "zones": [
    { "id": "z1", "name": "Gate A — North", "level": 1, "capacity": 5000, "density": 45,
      "alertLevel": "normal", "x": 10, "y": 10, "width": 20, "height": 15 }
  ],
  "amenities": [
    { "id": "a1", "name": "Food Court A", "type": "food", "level": 1, "section": "North", 
      "waitMinutes": 8, "isOpen": true, "x": 15, "y": 20 }
  ]
}
```

### 6.2 crowdFeed.json
```json
{
  "_meta": { "source": "MOCK — simulated data, not real-time", "refreshMs": 5000 },
  "timestamp": 1720000000000,
  "totalAttendance": 62400,
  "capacity": 82500,
  "entryRate": 340,
  "exitRate": 12,
  "bottlenecks": ["Gate C", "Food Court Level 1"],
  "zones": [
    { "id": "z1", "name": "Gate A", "density": 45, "alertLevel": "normal" }
  ]
}
```

### 6.3 transitOptions.json
```json
{
  "_meta": { "source": "MOCK — simulated data, not real-time", "refreshMs": 15000 },
  "options": [
    {
      "id": "t1", "type": "shuttle", "name": "Shuttle Route 1",
      "from": "MetLife Stadium", "to": "Newark Penn Station",
      "frequency": 8, "capacity": 55, "currentLoad": 62,
      "nextDeparture": 1720003200000, "status": "on-time", "delay": 0,
      "estimatedMinutes": 22
    },
    {
      "id": "t2", "type": "train", "name": "NJ Transit — Meadowlands Line",
      "from": "Meadowlands Station", "to": "Hoboken Terminal",
      "frequency": 15, "capacity": 400, "currentLoad": 55,
      "nextDeparture": 1720003500000, "status": "on-time", "delay": 0,
      "estimatedMinutes": 35
    }
  ]
}
```

---

## 7. Incidents Collection (Simulated Firestore Schema)

```typescript
interface Incident {
  id: string;          // auto-generated UUID
  title: string;       // max 100 chars
  description: string; // max 500 chars
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'resolved';
  category: 'medical' | 'security' | 'crowd' | 'technical' | 'fire' | 'other';
  location: string;    // zone name
  zoneId: string;
  reportedAt: number;  // Unix ms timestamp
  assignedTo?: string;
  aiProtocol?: string; // Gemini-generated response steps
  resolvedAt?: number;
}
```

---

## 8. Risk Score Algorithm

```typescript
// Computes a 0–100 crowd risk score across all zones
// MOCK DATA — result is based on simulated zone densities
export function computeRiskScore(zones: Zone[]): number {
  if (!zones.length) return 0;
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const weightedDensity = zones.reduce((sum, z) => sum + (z.density * z.capacity), 0);
  const avgDensity = totalCapacity > 0 ? weightedDensity / totalCapacity : 0;
  // Apply non-linear penalty for critical zones
  const criticalPenalty = zones.filter(z => z.alertLevel === 'critical').length * 8;
  const warningPenalty = zones.filter(z => z.alertLevel === 'warning').length * 3;
  return Math.min(100, Math.round(avgDensity + criticalPenalty + warningPenalty));
}
```

---

## 9. Transit Ranking Algorithm

```typescript
// Ranks transit options by availability score (higher = better)
// MOCK DATA — based on simulated loads and departure times
export function rankTransitOptions(options: TransitOption[]): TransitOption[] {
  return [...options].sort((a, b) => {
    const aScore = (100 - a.currentLoad) * 0.5 +
                   (a.nextDeparture - Date.now() < 600000 ? 30 : 0) + // bonus for < 10min
                   (a.status === 'on-time' ? 20 : 0);
    const bScore = (100 - b.currentLoad) * 0.5 +
                   (b.nextDeparture - Date.now() < 600000 ? 30 : 0) +
                   (b.status === 'on-time' ? 20 : 0);
    return bScore - aScore;
  });
}
```
