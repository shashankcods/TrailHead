import { GoogleGenAI }
from "@google/genai";

const ai =
  new GoogleGenAI({

    apiKey:
      process.env.GEMINI_API_KEY
  });

export const generateItinerary =
  async (plannerData) => {

    const response =
      await ai.models.generateContent({

        model:
          "gemini-3.5-flash",

        contents: `

Generate a realistic travel itinerary.

Trip Data:
${JSON.stringify(plannerData)}

Rules:
- stay under budget
- realistic timings
- nightlife only at night
- balance activities
- avoid overcrowding

`
      });

    return response.text;
};