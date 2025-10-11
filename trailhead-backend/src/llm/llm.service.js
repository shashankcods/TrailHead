// src/services/llm.service.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config'; // Loads variables from .env file

// --- 1. Initialize the Gemini Client ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a travel itinerary summary using the Gemini API.
 * @param {object} orchestratorJson The JSON data from the orchestrator service.
 * @returns {Promise<object>} A promise that resolves to the structured itinerary JSON.
 */
export async function getLLMSummary(orchestratorJson) {
  try {
    // --- 2. Select Model and Configure for JSON Output ---
    // gemini-1.5-flash-latest is fast and cost-effective, perfect for this task.
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json', // This enables JSON Mode!
        temperature: 0.2,
      },
    });

    // --- 3. Create a Refined Prompt for Gemini ---
    const prompt = `
You are a travel planning assistant. Analyze the provided JSON data to create a concise, day-by-day travel plan.
Your entire response MUST be a single, valid JSON object that strictly adheres to the following schema:
{
  "summary": "A 2-4 line overview of the trip.",
  "itinerary": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "title": "A short, thematic title for the day",
      "activities": ["string", "string", "..."]
    }
  ]
}

Incorporate hotels and restaurants from the input data where it makes sense. The dates should correspond to the metadata provided.

**Input Data:**
${JSON.stringify(orchestratorJson, null, 2)}
`;

    console.log("🚀 Sending request to Gemini API...");

    // --- 4. Call the API and Parse the Response ---
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text();

    console.log("✅ Received and parsed JSON response from Gemini.");
    return JSON.parse(jsonText); // The SDK ensures this text is valid JSON

  } catch (error) {
    console.error(`❌ Error calling Gemini API: ${error.message}`);
    // Return your standard fallback response on any failure
    return { fallback: true, itinerary: [], summary: "Summarization failed." };
  }
}