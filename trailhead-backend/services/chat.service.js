import { GoogleGenAI } from "@google/genai";

const ALLOWED_ACTION_TYPES = new Set([
  "ANSWER_ONLY",
  "REMOVE_ACTIVITY",
  "ADD_ACTIVITY",
  "MOVE_ACTIVITY",
  "UPDATE_ACTIVITY",
]);

const SYSTEM_PROMPT = `You are TrailHead Trip Assistant. You help users understand and edit their trip itinerary.

Rules:
- Use ONLY the provided trip context. Never invent live prices, live flight availability, or hotel availability.
- For general questions, answer clearly and concisely.
- For itinerary edits, return exactly ONE structured action from the allowed schema.
- NEVER return full plannerData or a full itinerary JSON.
- If the user request is ambiguous (unclear day or activity), ask a clarification question and use action type ANSWER_ONLY.
- If the user only asks a question, use ANSWER_ONLY.

Allowed action types:
- ANSWER_ONLY (no payload)
- REMOVE_ACTIVITY: { dayNumber?, activityId?, activityTitle? }
- ADD_ACTIVITY: { dayNumber, activity: { title or name required, optional id, category, scheduledTime } }
- MOVE_ACTIVITY: { fromDayNumber?, toDayNumber, activityId?, activityTitle?, timeLabel? }
- UPDATE_ACTIVITY: { dayNumber?, activityId?, activityTitle?, updates: partial activity fields }

Return ONLY valid JSON with this shape:
{
  "reply": "string",
  "action": { "type": "ANSWER_ONLY" } | { "type": "...", "payload": { ... } }
}`;

function buildCompactContext(plannerData = {}) {
  const itinerary = plannerData.itinerary;
  const days = Array.isArray(itinerary)
    ? itinerary
    : Array.isArray(itinerary?.days)
      ? itinerary.days
      : [];

  return {
    trip: plannerData.trip ?? null,
    interests: plannerData.interests ?? [],
    budgets: plannerData.budgets ?? null,
    itinerary: days.map((day, index) => ({
      day: day.day ?? day.dayNumber ?? index + 1,
      title: day.title ?? day.theme ?? day.name,
      activities: (day.activities ?? []).map((activity) => ({
        id: activity.id ?? activity.activityId,
        title: activity.title ?? activity.name,
        category: activity.category ?? activity.type,
        scheduledTime: activity.scheduledTime,
        startTime: activity.startTime,
        time: activity.time,
        cost: activity.cost ?? activity.estimatedCost,
      })),
    })),
    flights: plannerData.flights
      ? {
          route: plannerData.flights.route,
          departureAirport: plannerData.flights.departureAirport,
          arrivalAirport: plannerData.flights.arrivalAirport,
          outboundDate: plannerData.flights.outboundDate,
          returnDate: plannerData.flights.returnDate,
          totalResults: plannerData.flights.totalResults,
        }
      : null,
    weather: plannerData.weather
      ? {
          destination: plannerData.weather.destination,
          forecast: (plannerData.weather.forecast ?? []).slice(0, 5),
        }
      : null,
    hotels: plannerData.hotels?.destination
      ? { destination: plannerData.hotels.destination }
      : null,
  };
}

function parseModelJson(text) {
  const cleaned = String(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
}

function sanitizeAction(action) {
  if (!action || typeof action !== "object") {
    return { type: "ANSWER_ONLY" };
  }

  const type = String(action.type ?? "ANSWER_ONLY").toUpperCase();
  if (!ALLOWED_ACTION_TYPES.has(type)) {
    return { type: "ANSWER_ONLY" };
  }

  if (type === "ANSWER_ONLY") {
    return { type: "ANSWER_ONLY" };
  }

  return {
    type,
    payload: action.payload && typeof action.payload === "object" ? action.payload : {},
  };
}

function tryLocalRemove(message) {
  const patterns = [
    /remove\s+(.+?)\s+from\s+day\s+(\d+)/i,
    /remove\s+(.+?)\s+on\s+day\s+(\d+)/i,
    /delete\s+(.+?)\s+from\s+day\s+(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (!match) continue;

    const activityTitle = match[1].trim();
    const dayNumber = Number(match[2]);

    if (!activityTitle || !Number.isFinite(dayNumber)) continue;

    return {
      reply: `Removed ${activityTitle} from Day ${dayNumber}.`,
      action: {
        type: "REMOVE_ACTIVITY",
        payload: { dayNumber, activityTitle },
      },
    };
  }

  return null;
}

function fallbackResponse(message) {
  const local = tryLocalRemove(message);
  if (local) return local;

  return {
    reply:
      "I can help with your itinerary, but the AI service is not configured yet. For simple edits, try: \"remove [activity name] from day [number]\".",
    action: { type: "ANSWER_ONLY" },
  };
}

export async function handleTripChat({ message, plannerData, chatHistory = [] }) {
  const compactContext = buildCompactContext(plannerData);
  const history = chatHistory
    .slice(-10)
    .map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: String(entry.content ?? "").slice(0, 2000),
    }));

  if (!process.env.GEMINI_API_KEY) {
    return fallbackResponse(message);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const userPrompt = `TRIP CONTEXT:
${JSON.stringify(compactContext)}

CHAT HISTORY:
${JSON.stringify(history)}

USER MESSAGE:
${message}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";
    const parsed = parseModelJson(text);

    return {
      reply: String(parsed.reply ?? "Here is my response."),
      action: sanitizeAction(parsed.action),
    };
  } catch (error) {
    console.error("Chat service error:", error?.message ?? error);

    const local = tryLocalRemove(message);
    if (local) return local;

    return {
      reply:
        "Something went wrong while processing your request. Please try again in a moment.",
      action: { type: "ANSWER_ONLY" },
    };
  }
}
