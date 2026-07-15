# FanSetu AI — Product Requirements Document

**Product**: FanSetu AI (Fan Bridge AI)  
**Hackathon**: Hack2skill "Prompt Wars — Build with AI" powered by Google for Developers  
**Version**: 1.0  
**Date**: 2026-07-15  

---

## 1. Product Overview

FanSetu AI is a **GenAI-enabled, role-aware stadium operations and fan experience platform** built for the FIFA World Cup 2026. The name "FanSetu" (from Hindi: *सेतु* = bridge) represents bridging fans, staff, volunteers, and organizers through a unified AI assistant.

The platform covers **four unified verticals**:
1. **Fan Experience** — Navigation, wayfinding, food, transport, multilingual chat
2. **Stadium Operations** — Incident reporting, crowd monitoring, staff dispatch
3. **Tournament Command** — Organizer KPIs, AI-generated briefings, sustainability tracking
4. **Volunteer Hub** — Shift management, zone assignments, emergency protocols

All four verticals are unified in a single application because FIFA World Cup operations are deeply interdependent — a crowd surge immediately affects transport, volunteer tasks, and organizer decisions simultaneously.

---

## 2. Goals

| Priority | Goal |
|----------|------|
| P0 | Provide an AI assistant that understands context based on the user's role |
| P0 | Enable fans to navigate stadiums and find transport without paper maps |
| P0 | Allow staff to report and triage incidents with AI-generated response protocols |
| P1 | Give organizers real-time KPI dashboards with AI-generated executive briefings |
| P1 | Support volunteers with zone assignments and shift protocols |
| P2 | Full multilingual support (10 languages) using Gemini's translation capabilities |
| P2 | Accessibility features: screen reader, keyboard nav, high contrast, text resize |

---

## 3. User Personas

### 3.1 Fan (Primary)
- **Who**: International spectators at MetLife Stadium, NJ
- **Needs**: Find seat, find food/restrooms, get to stadium via transit, speak in native language
- **Pain Points**: Signage confusion, language barriers, long queues, not knowing best exit

### 3.2 Venue Staff / Steward (Primary)
- **Who**: 3,000+ venue operations staff on match day
- **Needs**: File incident reports quickly, receive AI response protocols, see crowd hotspots
- **Pain Points**: Paper-based incident logging, delayed communication, manual crowd triage

### 3.3 Tournament Organizer (Secondary)
- **Who**: FIFA/local org committee executives managing match day operations
- **Needs**: High-level KPI visibility, predictive insights, automated status briefings
- **Pain Points**: Information silos, manual report compilation, reactive (not proactive) decision-making

### 3.4 Volunteer (Secondary)
- **Who**: 10,000+ FIFA volunteers distributed across all venues
- **Needs**: Know their zone, see shift schedule, access emergency protocols
- **Pain Points**: Inconsistent briefing, no real-time guidance, language barriers

---

## 4. Core Features

### 4.1 Role Selector (FR-1)
Full-screen onboarding flow that routes users to their appropriate portal. Supports all four roles.

### 4.2 AI Chat Assistant (FR-2, FR-3)
- Context-aware system instructions per role
- Multilingual: responds in user's detected or selected language
- Mock fallback mode when no API key present
- Voice input support (Web Speech API)
- Conversation history persisted per session

### 4.3 Stadium Navigation (FR-4)
- Interactive SVG stadium map (MetLife Stadium, East Rutherford NJ)
- Zone-based crowd color overlay (green/yellow/red)
- AI gate recommendations based on current crowd density
- Amenity finder: food, restrooms, medical, accessibility

### 4.4 Transit & Transport (FR-5)
- Live shuttle board with AI-ranked options (mock data, refreshed every 15s)
- NJ Transit train and bus options
- Post-match exit planner with AI time recommendations
- Capacity bars with color alerts

### 4.5 Crowd Monitoring Dashboard (FR-6)
- Real-time simulated crowd density per zone
- Congestion heatmap table
- Risk score computation (0–100)
- AI-generated alerts when zones exceed thresholds

### 4.6 Incident Management (FR-7, FR-8)
- Submit incident form (category, severity, location, description)
- AI-generated response protocol per incident category
- Incident status board with filter/sort
- Live incidents feed in Dashboard

### 4.7 Organizer Command Center (FR-9)
- KPI cards: attendance, incidents, shuttle load, sustainability score
- Radar chart for operational health
- Gemini-powered match briefing generator
- Sustainability metrics with Recharts

### 4.8 Volunteer Hub (FR-10)
- Shift schedule and zone assignment
- Today's task list with AI-suggested priorities
- Emergency protocol lookup
- Contact supervisor action

---

## 5. Constraints

1. **Free-tier only**: Gemini API (Google AI Studio key), Firebase Spark plan
2. **No secrets in code**: All keys via environment variables
3. **Repo < 10 MB**: No committed node_modules, build output, or large binaries
4. **Single branch**: Public GitHub repo, one branch only
5. **Mock data**: All live data (crowd, transit, stadium) is simulated — clearly labeled
6. **Graceful degradation**: App must function fully in mock mode without any API key

---

## 6. Non-Goals (Out of Scope)

- Real ticketing or payment systems
- Actual Firebase Functions deployment (proxied locally for demo)
- Real-time integrations with external stadium/transit APIs
- Native mobile app (web-responsive only)
- User authentication / accounts

---

## 7. Success Metrics (Hackathon Evaluation)

| Criterion | Target |
|-----------|--------|
| AI Integration | Gemini used for chat, briefings, incident protocols, and multilingual responses |
| User Experience | Role-specific dashboards, smooth animations, accessible |
| Technical Depth | Risk scoring algorithm, transit ranking, language fallback, mock data pipeline |
| Code Quality | TypeScript, modular, commented, unit tested |
| Documentation | Complete README with architecture, assumptions, setup |

---

## 8. Open Assumptions (from Build Order)

1. PRD.md and SRS.md are authored as the source of truth since they were referenced but did not exist at project start.
2. Firebase Cloud Functions Gemini proxy is simulated as a direct client-side call for the Vite build.
3. Firestore incidents collection is simulated in-memory in Zustand.
4. STITCH_UI_PROMPT.md is not present — UI derived from existing screens plus PRD/SRS.
5. "FanSetu AI" branding replaces "StadiumIQ" throughout.
