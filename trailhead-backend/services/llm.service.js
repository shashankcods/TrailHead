import { GoogleGenAI }
from "@google/genai";
import { buildFallbackItinerary } from "../utils/buildFallbackItinerary.js";

const ai =
  new GoogleGenAI({

    apiKey:
      process.env.GEMINI_API_KEY
  });


// =========================
// Structured Itinerary
// =========================

export const generateStructuredItinerary =
  async ({

    trip,

    interests,

    budget,

    compactActivities
  }) => {

    const prompt = `

You are an expert travel itinerary planner.

Generate a realistic multi-day itinerary.

IMPORTANT:
- Return ONLY valid JSON
- No markdown
- No explanations
- No code blocks

RULES:
- Stay within total budget
- Balance sightseeing, nightlife, shopping, and food
- Avoid overcrowding days
- Nightlife only at night
- Morning activities should prefer sightseeing/cultural places
- Restaurants should be near activities logically
- Use ONLY provided activity IDs
- Max 4 activities per day
- Avoid repeating same category too often
- Use realistic timings

TRIP INFO:
${JSON.stringify(trip)}

USER INTERESTS:
${JSON.stringify(interests)}

BUDGET:
${JSON.stringify(budget)}

AVAILABLE ACTIVITIES:
${JSON.stringify(compactActivities)}

RETURN JSON IN THIS EXACT FORMAT:

{
  "days": [
    {
      "day": 1,
      "theme": "Historic Berlin",
      "activities": [
        {
          "activityId": "attr_xxx",
          "scheduledTime": {
            "start": "09:00",
            "end": "10:30"
          }
        }
      ]
    }
  ]
}

`;

    const defaultModels = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.5-flash",
      "gemini-3.5-flash"
    ];

    const envModels = process.env.GEMINI_MODELS 
      ? process.env.GEMINI_MODELS.split(',').map(m => m.trim()).filter(Boolean)
      : [];

    const modelsToTry = envModels.length > 0 ? envModels : defaultModels;

    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model}`);
        const response =
          await ai.models.generateContent({

            model:
              model,
            contents:
              prompt
          });

        const rawText =
          response.text;

        const cleaned =
          rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleaned);
        console.log(`Success with model: ${model}`);
        return parsed;

      } catch (error) {
        // Check error code/status
        const statusCode = error.status || error.response?.status;
        const is404 = statusCode === 404 || error.message.toLowerCase().includes("not found");
        const is429 = statusCode === 429 || error.message.toLowerCase().includes("quota");
        const is503 = statusCode === 503 || error.message.toLowerCase().includes("unavailable");

        if (is404) {
          console.error(`Model ${model} not found (404), skipping...`);
        } else if (is429 || is503) {
          console.error(`Model ${model} returned ${statusCode}: ${error.message}, trying next model...`);
        } else {
          console.error(`Error with model ${model}:`, error.message);
        }
        // Continue to next model for all errors
      }
    }

    // If all models fail, build fallback itinerary
    console.warn("All Gemini models failed, using fallback itinerary.");
    return buildFallbackItinerary({
      trip_days: trip.trip_days,
      destination: trip.destination,
      activities: compactActivities,
    });
};