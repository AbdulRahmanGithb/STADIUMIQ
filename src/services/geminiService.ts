/**
 * geminiService.ts — FanSetu AI
 * Handles all Google Gemini API interactions with:
 *  - Role-specific system instructions (SRS FR-2)
 *  - Input sanitization (SRS NFR-2)
 *  - Language fallback to English in mock mode (SRS FR-3.2)
 *  - Mock mode when VITE_GEMINI_API_KEY is absent/invalid
 */
import { ChatMessage, Language, UserRole } from '../types';

// ── Input Sanitization (SRS NFR-2.2) ─────────────────────────────────────────
/** Strip HTML entities, trim, and enforce max length on user input before sending to Gemini */
export function sanitizeInput(raw: string, maxLen = 500): string {
  return raw
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .trim()
    .slice(0, maxLen);
}

// ── Role-Specific System Instructions (SRS FR-2.2) ────────────────────────────
const ROLE_SYSTEM_INSTRUCTIONS: Record<UserRole, string> = {
  fan:
    'You are FanSetu AI, a helpful FIFA World Cup 2026 fan assistant at MetLife Stadium, East Rutherford NJ. ' +
    'Help fans with navigation (seat finding, gate directions), food & beverage options, transport schedules, ' +
    'accessibility services, and overall match-day experience. Always be warm, friendly, and proactive. ' +
    'Respond in the user\'s selected language. Use emojis sparingly for warmth. Prioritize safety.',

  staff:
    'You are FanSetu AI, a stadium operations assistant for FIFA World Cup 2026 staff at MetLife Stadium. ' +
    'Help venue staff with incident management, crowd control decisions, dispatch recommendations, and ' +
    'operational protocols. Be concise, direct, and actionable. Use numbered steps for protocols. ' +
    'Escalate critical incidents clearly. Respond in English unless asked otherwise.',

  organizer:
    'You are FanSetu AI, an executive AI assistant for FIFA World Cup 2026 tournament organizers. ' +
    'Provide strategic insights, KPI summaries, crowd predictions, sustainability status, and clear ' +
    'decision support. Use a professional, executive tone suitable for senior tournament officials. ' +
    'Format responses with clear sections. Respond in English.',

  volunteer:
    'You are FanSetu AI, a volunteer support assistant for FIFA World Cup 2026 at MetLife Stadium. ' +
    'Help volunteers with zone assignments, shift information, emergency protocols, FAQ answers, and ' +
    'interpersonal escalation guidance. Be encouraging and clear. ' +
    'Respond in the volunteer\'s language if different from English.',
};

// ── Mock Responses (used when API key missing or API call fails) ───────────────
// MOCK DATA — these are static responses, not real-time AI
const MOCK_RESPONSES: Record<string, string> = {
  default:
    "Hello! I'm FanSetu AI, your AI companion for FIFA World Cup 2026 at MetLife Stadium. " +
    "How can I help you today? I can assist with navigation, transport, food, accessibility, and more. ⚽",
  navigate:
    "Based on current crowd density, I recommend using Gate D (Southeast) — it currently has only 23% occupancy. " +
    "Your seat in Section 114 is a 4-minute walk from Gate D via Level 2 corridor. The north concourse is clear.",
  food:
    "The nearest open food courts: Gate A (North) has ~5 min wait, Gate E (South) has ~12 min. " +
    "Gate F (West) is currently OVERCROWDED — AI recommends avoiding it. Halal, vegetarian, and gluten-free options are at Gate A. 🌮",
  transport:
    "Shuttle Route 2 to Secaucus Junction departs in about 3 minutes from Zone B — South Lot (35% capacity). " +
    "That's your best option right now. NJ Transit Meadowlands Line is also available with a 5-min walk north. 🚌",
  crowd:
    "Current crowd density: Food Court Level 1 is at CRITICAL (94%). Gate F West is at 91% — AI redirect active. " +
    "Gate D (Southeast) is the calmest at 23%. I'll alert you if other zones exceed 80%. 📊",
  emergency:
    "🚨 Please remain calm. Stadium security and medical teams have been notified. " +
    "Follow the GREEN exit signs to your nearest assembly point. Do NOT use elevators. " +
    "Medical Station 1 is at Gate A North, Medical Station 2 is at Gate E South.",
  accessibility:
    "Accessibility services: Accessibility Hub at Gate A (North) — open now, no wait. " +
    "Wheelchair-accessible seating in Sections 100–105. Accessible shuttle runs every 10 min from North entrance. " +
    "Audio description service available at info booth. ♿",
  parking:
    "Parking Zone P1-P3 is at 67% capacity. Plan to exit within 30 minutes of final whistle to avoid congestion. " +
    "AI estimated exit time: 35–40 minutes for P3. Route 2 shuttle is faster than driving right now. 🚗",
  sustainability:
    "Great news! This match is tracking toward carbon-neutral status. 67% of energy is from renewable sources. " +
    "Current recycling rate: 65.6% (target: 80%). Please use the GREEN bins to help! 🌱",
  incident:
    "Incident logged. AI-generated protocol: 1. Secure perimeter, 2. Notify control room, " +
    "3. Deploy nearest response team, 4. Document in system. ETA for response: 2–4 minutes.",
  briefing:
    "# Match Day Briefing — MetLife Stadium\n\n**FanSetu AI** | Generated " + new Date().toLocaleString() + "\n\n" +
    "## Executive Summary\nBrazil vs Argentina — historic rivalry at MetLife Stadium. Expected 80,000 fans (97% capacity). " +
    "High security protocols active.\n\n## Status\n✅ 24 gates operational · ✅ Medical teams positioned · ⚠️ Food Court Level 1 at CRITICAL\n\n" +
    "## Recommendations\n1. Deploy 3 stewards to Food Court Level 1\n2. Open Gate D overflow immediately\n3. Increase Route 2 shuttle frequency by 30%\n4. Activate multilingual PA system",
};

/** Simple keyword-based mock response selector */
function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (/gate|seat|section|where|navigate|find|map|direct/i.test(lower)) return MOCK_RESPONSES.navigate;
  if (/food|eat|drink|halal|vegan|vegetar|kiosk|vendor/i.test(lower)) return MOCK_RESPONSES.food;
  if (/shuttle|bus|transport|train|uber|lyft|secaucus|newark|hoboken/i.test(lower)) return MOCK_RESPONSES.transport;
  if (/crowd|busy|congestion|packed|density|queue/i.test(lower)) return MOCK_RESPONSES.crowd;
  if (/emergency|help|medical|fire|danger|evacuate|injury/i.test(lower)) return MOCK_RESPONSES.emergency;
  if (/wheelchair|access|disabled|mobility|blind|deaf/i.test(lower)) return MOCK_RESPONSES.accessibility;
  if (/park|car|exit|depart/i.test(lower)) return MOCK_RESPONSES.parking;
  if (/green|sustain|recycle|carbon|energy|solar/i.test(lower)) return MOCK_RESPONSES.sustainability;
  if (/incident|report|alert|flag/i.test(lower)) return MOCK_RESPONSES.incident;
  if (/brief|kpi|summary|organizer|status/i.test(lower)) return MOCK_RESPONSES.briefing;
  return MOCK_RESPONSES.default;
}

// ── Language Greetings ─────────────────────────────────────────────────────────
const LANGUAGE_GREETINGS: Record<Language, string> = {
  en: "Hello! I'm FanSetu AI, your World Cup assistant.",
  es: "¡Hola! Soy FanSetu AI, tu asistente de la Copa del Mundo.",
  fr: "Bonjour! Je suis FanSetu AI, votre assistant de la Coupe du Monde.",
  ar: "مرحباً! أنا FanSetu AI، مساعدك لكأس العالم.",
  pt: "Olá! Sou FanSetu AI, seu assistente da Copa do Mundo.",
  de: "Hallo! Ich bin FanSetu AI, Ihr WM-Assistent.",
  zh: "你好！我是FanSetu AI，您的世界杯助手。",
  ja: "こんにちは！FanSetu AI、ワールドカップアシスタントです。",
  hi: "नमस्ते! मैं FanSetu AI हूं, आपका विश्व कप सहायक।",
  ur: "السلام علیکم! میں FanSetu AI ہوں، آپ کا ورلڈ کپ معاون۔",
};

export function getLanguageGreeting(lang: Language): string {
  return LANGUAGE_GREETINGS[lang] ?? LANGUAGE_GREETINGS.en;
}

// ── Main Chat Function (FR-3) ─────────────────────────────────────────────────
export async function sendMessage(
  rawMessage: string,
  history: ChatMessage[],
  role: UserRole,
  language: Language
): Promise<string> {
  // Sanitize input (NFR-2.2)
  const message = sanitizeInput(rawMessage);
  if (!message) return 'Please enter a message.';

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Mock mode (FR-3.2: fallback returns English)
  if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500)); // simulate network latency
    return getMockResponse(message);
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use Flash for chat (cost-efficient), Pro for briefings
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // FR-2.3: Include stadium context in every prompt
    const systemPrompt =
      `${ROLE_SYSTEM_INSTRUCTIONS[role]}\n\n` +
      `CURRENT CONTEXT:\n` +
      `- Stadium: MetLife Stadium, East Rutherford, NJ (FIFA World Cup 2026)\n` +
      `- Match: Brazil vs Argentina — kick-off in ~2 hours\n` +
      `- Expected attendance: 80,000 (97% capacity)\n` +
      `- Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n` +
      `- User language preference: ${language}\n` +
      `- Respond in: ${language === 'en' ? 'English' : language} (match the user's language)\n` +
      `NOTE: All crowd/transit data shown is SIMULATED for demo purposes.`;

    const chat = model.startChat({
      // Include last 6 messages for context (FR-3.5)
      history: history.slice(-6).map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
    });

    const result = await chat.sendMessage(
      `[System: ${systemPrompt}]\n\nUser message: ${message}`
    );
    return result.response.text();
  } catch (err) {
    console.error('[FanSetu AI] Gemini API error, falling back to mock:', err);
    // Language fallback: mock always returns English (SRS FR-3.2)
    return getMockResponse(message);
  }
}

// ── Match Briefing Generator (FR-9.3) ─────────────────────────────────────────
export async function generateMatchBriefing(
  stadiumName: string,
  matchData: Record<string, unknown>
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
    await new Promise(r => setTimeout(r, 1800));
    // MOCK DATA — static briefing template
    return (
      `# Match Day Briefing — ${stadiumName}\n` +
      `**Generated by FanSetu AI** | ${new Date().toLocaleString()}\n` +
      `*⚠️ All figures are SIMULATED for demo purposes*\n\n` +
      `## Executive Summary\n` +
      `Brazil vs Argentina — The biggest rivalry in football comes to MetLife Stadium. ` +
      `Expected attendance: **80,000 fans (97% capacity)**. ` +
      `High security and crowd management protocols are active.\n\n` +
      `## Operational Status\n` +
      `- ✅ All 24 entry gates operational\n` +
      `- ✅ Medical teams (12 units) positioned at all zones\n` +
      `- ✅ Shuttle service running at 95% frequency\n` +
      `- 🔴 Food Court Level 1 at CRITICAL (94%) — redirect active via PA\n` +
      `- ⚠️ Gate F (West) congestion at 91% — overflow to Gate D recommended\n\n` +
      `## AI Crowd Predictions\n` +
      `Peak entry expected **60–90 minutes before kick-off**. ` +
      `Post-match exit will concentrate at Gates A and E. Pre-position crowd management at those points.\n\n` +
      `## Sustainability Targets\n` +
      `- 🔋 Energy: On track — 67% renewable\n` +
      `- ♻️ Recycling: 65.6% (target: 80%) — deploy extra volunteers to recycling zones\n\n` +
      `## Recommended Actions\n` +
      `1. Deploy 3 additional stewards to Food Court Level 1 immediately\n` +
      `2. Open Gate D as primary overflow — estimated relief: 15 min\n` +
      `3. Increase Route 2 shuttle frequency by 30% from 17:00\n` +
      `4. Activate multilingual PA announcement system at all gates\n` +
      `5. Pre-position 4 medical units at south concourse for post-match crowd\n\n` +
      `*Briefing generated by FanSetu AI (Gemini). Verify with live dashboard before actioning.*`
    );
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use Pro for higher-quality briefings (FR-9.3)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt =
      `You are FanSetu AI, an executive match-day operations assistant for FIFA World Cup 2026 organizers.\n\n` +
      `Generate a professional match-day operational briefing for:\n` +
      `Stadium: ${stadiumName}\n` +
      `Match Data: ${JSON.stringify(matchData)}\n\n` +
      `Include these sections with markdown headers:\n` +
      `1. Executive Summary\n2. Operational Status\n3. AI Crowd Predictions\n4. Sustainability Status\n5. Recommended Actions (numbered list)\n\n` +
      `Add a footer: "Generated by FanSetu AI | All crowd figures are simulated."\n` +
      `Be concise, professional, and actionable for senior tournament officials.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('[FanSetu AI] Gemini Pro error in briefing:', err);
    return '⚠️ Unable to generate briefing. Please check your API key and try again.';
  }
}

// ── Incident Protocol Generator (FR-7.4, FR-8) ───────────────────────────────
export async function analyzeIncident(
  incident: Record<string, unknown>
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
    await new Promise(r => setTimeout(r, 700));
    // MOCK DATA — static protocols per category
    const protocols: Record<string, string> = {
      medical:
        '1. Clear a 3m radius around the patient immediately.\n' +
        '2. Dispatch nearest medical unit (ETA: 2 min from Medical Station 1).\n' +
        '3. Notify Gate C medical station via radio channel 4.\n' +
        '4. Guide family/escorts to Section 112 first aid room.',
      security:
        '1. Alert security control room immediately via radio channel 1.\n' +
        '2. Deploy 2 nearest stewards to contain the area — do not engage alone.\n' +
        '3. Review CCTV feed from Zone B, Camera 4 within 2 minutes.\n' +
        '4. Escalate to police liaison (Officer Chen, ext. 5501) if unresolved in 5 min.',
      crowd:
        '1. Open Gate D as overflow exit — announce via PA on channel 3.\n' +
        '2. Redirect crowd using PA: "Fans, please move to Gates A and D for faster access."\n' +
        '3. Pause new entry at affected gate for 5 minutes.\n' +
        '4. Deploy 4 crowd management officers to create flow lanes.',
      fire:
        '1. Activate fire protocol ALPHA — alert all zone stewards.\n' +
        '2. Evacuate a 50m radius immediately — lead fans to nearest exit.\n' +
        '3. PA announcement: "Attention all fans, please calmly proceed to the nearest exit."\n' +
        '4. Emergency services auto-notified — do not block access lanes.',
      technical:
        '1. Dispatch technical team to site (ETA: 5 min — pager sent).\n' +
        '2. Switch to backup system if available.\n' +
        '3. Notify zone stewards to manage manually in the interim.\n' +
        '4. Log all details in incident system for post-event vendor review.',
      other:
        '1. Assess the situation and ensure area is safe.\n' +
        '2. Document all details: location, time, persons involved.\n' +
        '3. Escalate to shift supervisor if uncertain on next steps.\n' +
        '4. Log in the incident system and monitor for 15 minutes.',
    };
    const category = (incident.category as string) || 'other';
    return protocols[category] ?? protocols.other;
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const sanitizedIncident = sanitizeInput(JSON.stringify(incident));
    const result = await model.generateContent(
      `You are FanSetu AI, a FIFA World Cup stadium safety assistant.\n` +
      `Generate a concise 4-step response protocol for this incident at MetLife Stadium:\n${sanitizedIncident}\n\n` +
      `Format: Number each step. Be specific and actionable. Include ETA estimates where relevant. Max 200 words.`
    );
    return result.response.text();
  } catch {
    return '⚠️ Protocol unavailable. Follow standard FIFA emergency procedures. Escalate to supervisor immediately.';
  }
}
