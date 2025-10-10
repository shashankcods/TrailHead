// src/llm/llm.service.js
import axios from "axios";

const OLLAMA_API = "http://localhost:11434/api/generate";

export const summarizeTripLLM = async (rawData) => {
  try {
    // ----------------------------------------------------------------------
    // STEP 1: Prepare and sanitize the orchestrator data
    // ----------------------------------------------------------------------
    let jsonString = "";

    try {
      // Convert JSON to a compact string and remove extra whitespace
      jsonString = JSON.stringify(rawData, null, 0)
        .replace(/\s+/g, " ")
        .slice(0, 15000); // limit ~15k chars to prevent model freeze
    } catch (err) {
      console.error("❌ Failed to stringify rawData:", err.message);
      return null;
    }

    // ----------------------------------------------------------------------
    // STEP 2: Build the improved summarization prompt
    // ----------------------------------------------------------------------
    const prompt = `
You are a highly capable travel data summarization model.

You will be given a JSON object containing data about a user's trip
(collected from multiple sources: maps, weather, food, events, accommodation, reddit, etc.).

Your task:
- Read and understand the data.
- Summarize it clearly and concisely.
- Output a STRICT JSON object only. No markdown, no natural language sentences outside the JSON.

Rules:
1. Do not include commentary, markdown, or explanations.
2. Include only the most relevant and human-friendly data.
3. Each array should have up to 3 items max.
4. Preserve weather forecast as-is (do not drop dates).

Here is the input data to summarize:
${jsonString}

Now analyze the JSON above and return ONLY a valid JSON object following this schema exactly:

{
  "summary": "A 3–5 line overview of the trip, describing route and highlights.",
  "route": { "distance_km": "string", "duration_hr": "string" },
  "weather": "A short, human-readable summary of the forecast.",
  "top_hotels": [
    { "name": "string", "price": "string", "rating": "number" }
  ],
  "top_restaurants": [
    { "name": "string", "rating": "number" }
  ],
  "top_events": [
    { "name": "string", "date": "string", "venue": "string" }
  ]
}

Respond only with that JSON — no additional text.
`;

    console.log("🧠 Sending prompt to Ollama...");
    console.log("Prompt size:", prompt.length, "characters");

    // ----------------------------------------------------------------------
    // STEP 3: Send request to Ollama
    // ----------------------------------------------------------------------
    const response = await axios.post(
      OLLAMA_API,
      {
        model: "mistral", // or "mistral:7b-instruct-q4_K_M" if quantized model installed
        prompt,
        stream: false
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000 // 60s timeout
      }
    );

    console.log("✅ Ollama responded with status:", response.status);

    const textOutput = response.data?.response?.trim();

    if (!textOutput) {
      console.warn("⚠️ LLM returned empty response");
      return null;
    }

    // ----------------------------------------------------------------------
    // STEP 4: Try parsing JSON output safely
    // ----------------------------------------------------------------------
    try {
      const jsonOutput = JSON.parse(textOutput);
      console.log("✅ Successfully parsed LLM output");
      return jsonOutput;
    } catch (parseError) {
      console.error("⚠️ LLM output was not valid JSON:", parseError.message);
      console.log("Raw LLM output (first 500 chars):", textOutput.slice(0, 500));
      return null;
    }

  } catch (error) {
    console.error("💀 LLM summarization failed:", error.message);
    return null;
  }
};
