import {
  itineraryGraph
} from "../langgraph/itineraryModification.graph.js";

import {
  enrichItinerary
} from "../utils/enrichItinerary.js";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SUMMARY_MODELS = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

async function generateSummary(itinerary, trip) {
  const days = (itinerary?.days ?? []).map((d) => ({
    day: d.day ?? d.dayNumber,
    title: d.title ?? d.theme,
    activities: (d.activities ?? []).map((a) => a.title ?? a.name).filter(Boolean),
  }));

  const prompt = `You are a friendly travel assistant. Summarize this itinerary in 3-4 sentences. Be specific about highlights and the overall vibe. Keep it conversational, not bullet points.

Trip: ${trip?.source ?? "Origin"} → ${trip?.destination ?? "Destination"} (${trip?.trip_days ?? days.length} days, ${trip?.adults ?? 1} traveler(s))

Itinerary:
${days.map((d) => `Day ${d.day} – ${d.title}: ${d.activities.join(", ")}`).join("\n")}`;

  for (const model of SUMMARY_MODELS) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch {
      // try next model
    }
  }
  return null;
}

export const modifyItineraryController = async (req, res) => {
  try {
    const originalItinerary = req.body.itinerary;

    const result = await itineraryGraph.invoke({
      itinerary: req.body.itinerary,
      userMessage: req.body.userMessage,
      activities: req.body.activities,
      budget: req.body.budget,
      repairAttempts: 0,
    });

    const intent = result.intent ?? {};

    if (intent.action === "summarize") {
      const summary = await generateSummary(result.itinerary, req.body.trip);
      return res.status(200).json({
        success: true,
        itinerary: originalItinerary,
        intent,
        message: summary ?? "Here's your itinerary! It covers multiple days of activities across your destination.",
      });
    }

    if (result.validationResult?.valid === false) {
      return res.status(200).json({
        success: true,
        itinerary: originalItinerary,
        intent,
        message: "Sorry, I couldn't apply that change without creating scheduling conflicts. Try a more specific request.",
      });
    }

    const activityMap = new Map(
      (req.body.activities ?? []).map((a) => [a.id ?? a.activityId, a])
    );

    const enrichedItinerary = enrichItinerary({
      itinerary: result.itinerary,
      activityMap,
    });

    const couldNotUnderstand = !intent.action || intent.action === "unknown";

    return res.status(200).json({
      success: true,
      itinerary: enrichedItinerary,
      intent,
      message: couldNotUnderstand
        ? "I can help with specific edits — try 'add nightlife on day 1', 'add a restaurant on day 2', 'remove the museum visit', 'reduce the budget', or 'summarize this trip'."
        : undefined,
    });
  } catch (err) {
    console.error("[modifyItinerary] LangGraph error:", err);

    if (err?.message === "RATE_LIMIT") {
      return res.status(200).json({
        success: true,
        itinerary: req.body.itinerary,
        intent: { action: "unknown" },
        message: "The AI assistant is temporarily unavailable due to high usage. Please try again in a while.",
      });
    }

    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to modify itinerary",
    });
  }
};