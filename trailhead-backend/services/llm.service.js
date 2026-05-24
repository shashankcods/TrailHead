import { GoogleGenAI }
from "@google/genai";

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

    try {

      const response =
        await ai.models.generateContent({

          model:
            "gemini-2.5-flash",

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

      return JSON.parse(
        cleaned
      );

    } catch (error) {

      console.error(
        "Structured Itinerary Error:",
        error.message
      );

      throw error;
    }
};