import { ChatMessage, Language, UserRole } from '../types';

const MOCK_RESPONSES: Record<string, string> = {
  default: "Hello! I'm StadiumIQ, your AI assistant for the FIFA World Cup 2026. How can I help you today? I can assist with navigation, transport, facilities, accessibility, and more.",
  navigate: "Based on current crowd density, I recommend using Gate D (North) — it currently has only 23% occupancy. Your seat in Section 114 is a 4-minute walk from Gate D via Level 2 corridor.",
  food: "The nearest food courts are at Gates B and E. Gate E has shorter wait times right now (~5 min). They offer halal, vegetarian, and gluten-free options. 🌮",
  transport: "The next shuttle to Newark Penn Station departs in 8 minutes from Pick-up Zone 3. Current capacity is 60%. I'd recommend this one to avoid the post-match rush.",
  crowd: "Crowd density in your area is currently at 45% — comfortable levels. I'll alert you when it exceeds 75%. The main concourse near Section 110 is getting busy.",
  emergency: "🚨 Please remain calm. Stadium security and medical teams have been notified. Follow the green exit signs to your nearest assembly point. Do not use elevators.",
  accessibility: "Accessibility services are available at Gates A and F. Wheelchair-accessible seating is in Sections 100–105. The accessibility shuttle runs every 10 minutes from the North entrance.",
  parking: "Your parking zone P4 is currently 78% full. I recommend departing within 30 minutes after the final whistle to avoid congestion. Estimated exit time: 35 minutes.",
  sustainability: "Great news! This match is on track to achieve carbon-neutral status. 67% of energy is from renewable sources today. Please use the green recycling bins to help us reach our 80% recycling goal! 🌱",
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('gate') || lower.includes('seat') || lower.includes('section') || lower.includes('where') || lower.includes('navigate') || lower.includes('find')) return MOCK_RESPONSES.navigate;
  if (lower.includes('food') || lower.includes('eat') || lower.includes('drink') || lower.includes('halal') || lower.includes('vegan')) return MOCK_RESPONSES.food;
  if (lower.includes('shuttle') || lower.includes('bus') || lower.includes('transport') || lower.includes('train') || lower.includes('uber')) return MOCK_RESPONSES.transport;
  if (lower.includes('crowd') || lower.includes('busy') || lower.includes('congestion') || lower.includes('packed')) return MOCK_RESPONSES.crowd;
  if (lower.includes('emergency') || lower.includes('help') || lower.includes('medical') || lower.includes('fire') || lower.includes('danger')) return MOCK_RESPONSES.emergency;
  if (lower.includes('wheelchair') || lower.includes('access') || lower.includes('disabled') || lower.includes('mobility')) return MOCK_RESPONSES.accessibility;
  if (lower.includes('park') || lower.includes('car') || lower.includes('exit')) return MOCK_RESPONSES.parking;
  if (lower.includes('green') || lower.includes('sustain') || lower.includes('recycle') || lower.includes('carbon')) return MOCK_RESPONSES.sustainability;
  return MOCK_RESPONSES.default;
}

const LANGUAGE_GREETINGS: Record<Language, string> = {
  en: "Hello! I'm your StadiumIQ assistant.",
  es: "¡Hola! Soy tu asistente StadiumIQ.",
  fr: "Bonjour! Je suis votre assistant StadiumIQ.",
  ar: "مرحباً! أنا مساعد StadiumIQ الخاص بك.",
  pt: "Olá! Sou seu assistente StadiumIQ.",
  de: "Hallo! Ich bin Ihr StadiumIQ-Assistent.",
  zh: "你好！我是您的StadiumIQ助手。",
  ja: "こんにちは！StadiumIQアシスタントです。",
  hi: "नमस्ते! मैं आपका StadiumIQ सहायक हूं।",
  ur: "السلام علیکم! میں آپ کا StadiumIQ معاون ہوں۔",
};

const ROLE_CONTEXTS: Record<UserRole, string> = {
  fan: 'You are a helpful FIFA World Cup 2026 fan assistant. Help fans with navigation, food, transport, and match day experience.',
  staff: 'You are a stadium operations AI assistant. Help staff with incident management, crowd control, and operational decisions.',
  organizer: 'You are an executive AI briefing assistant. Provide strategic insights, KPI summaries, and decision support for tournament organizers.',
  volunteer: 'You are a volunteer support assistant. Help volunteers with their assignments, FAQs, and zone responsibilities.',
};

export async function sendMessage(
  message: string,
  history: ChatMessage[],
  role: UserRole,
  language: Language
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Mock mode
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    return getMockResponse(message);
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `${ROLE_CONTEXTS[role]}

Current context:
- Stadium: MetLife Stadium, East Rutherford, NJ (FIFA World Cup 2026)
- Match: Brazil vs Argentina, kick-off in 2 hours
- Expected attendance: 80,000 fans
- Current crowd density: 45% (comfortable)
- Language: Respond in ${language === 'en' ? 'English' : language} unless the user writes in another language
- User role: ${role}

Be concise, helpful, and proactive. Use emojis sparingly for warmth. Always prioritize safety.`;

    const chat = model.startChat({
      history: history.slice(-6).map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    });

    const result = await chat.sendMessage(`[System context: ${systemPrompt}]\n\nUser: ${message}`);
    return result.response.text();
  } catch (err) {
    console.error('Gemini API error, falling back to mock:', err);
    return getMockResponse(message);
  }
}

export async function generateMatchBriefing(stadiumName: string, matchData: Record<string, unknown>): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    await new Promise(r => setTimeout(r, 1500));
    return `# Match Day Briefing — ${stadiumName}
**Generated by StadiumIQ AI** | ${new Date().toLocaleString()}

## Executive Summary
Brazil vs Argentina — The biggest rivalry in football comes to MetLife Stadium tonight. Expected attendance: 80,000 fans (97% capacity). High security and crowd management protocols are in effect.

## Operational Status
- ✅ All 24 entry gates operational
- ✅ Medical teams (12 units) positioned at all zones
- ✅ Shuttle service running at 95% capacity
- ⚠️ Gate C queue slightly elevated — recommend deploying 2 additional staff

## AI Crowd Predictions
Peak entry expected 60-90 minutes before kick-off. Post-match exit flow will concentrate at Gates A and D — pre-position crowd management personnel.

## Sustainability Targets
- Energy: On track for 72% renewable usage
- Recycling: Target 80%, currently trending at 67%

## Recommended Actions
1. Deploy 3 additional stewards to Section 200 concourse
2. Open overflow parking Zone P7 at 16:00
3. Increase shuttle frequency by 30% from 17:00
4. Activate multilingual announcement system at all gates

*This briefing was generated by StadiumIQ Gemini AI. Verify all figures with live operations dashboard.*`;
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Generate a professional match-day operational briefing for FIFA World Cup 2026 organizers.

Stadium: ${stadiumName}
Match Data: ${JSON.stringify(matchData)}

Include: Executive Summary, Operational Status, Crowd Predictions, Sustainability Status, and 4-5 Recommended Actions.
Format with markdown headers. Be concise but comprehensive. Use a professional tone suitable for senior tournament officials.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini Pro error:', err);
    return 'Unable to generate briefing. Please check your API key and try again.';
  }
}

export async function analyzeIncident(incident: Record<string, unknown>): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    await new Promise(r => setTimeout(r, 600));
    const protocols: Record<string, string> = {
      medical: '1. Clear 3m radius around patient. 2. Dispatch nearest medical unit (ETA: 2 min). 3. Notify Gate C medical station. 4. Guide fan escorts to Section 112 first aid.',
      security: '1. Alert security control room immediately. 2. Deploy 2 stewards to contain area. 3. Review CCTV feed from Zone B camera 4. 4. Escalate to police liaison if unresolved in 5 min.',
      crowd: '1. Open Gate F as overflow exit. 2. Redirect crowd via PA announcement. 3. Pause entry at affected gate. 4. Deploy 4 crowd management officers.',
      fire: '1. Activate fire protocol ALPHA. 2. Evacuate 50m radius immediately. 3. PA announcement: "Please calmly move to nearest exit." 4. Emergency services auto-notified.',
      technical: '1. Dispatch technical team (ETA: 5 min). 2. Switch to backup systems. 3. Notify affected zone stewards. 4. Log incident for post-event review.',
    };
    const category = (incident.category as string) || 'technical';
    return protocols[category] || protocols.technical;
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`As a FIFA World Cup stadium safety AI, provide a concise 4-step response protocol for this incident: ${JSON.stringify(incident)}. Number each step. Be specific and actionable.`);
    return result.response.text();
  } catch {
    return 'Protocol unavailable. Follow standard FIFA emergency procedures.';
  }
}

export function getLanguageGreeting(lang: Language): string {
  return LANGUAGE_GREETINGS[lang] || LANGUAGE_GREETINGS.en;
}
