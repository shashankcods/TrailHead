// src/llm/llm.controller.js

// FIX: Change the imported function name to match what's in the service file.
import { getLLMSummary } from "./llm.service.js";

export const summarizeTrip = async (req, res) => {
  console.log("✅ /api/llm/summarize endpoint hit");

  const rawData = req.body;
  if (!rawData || Object.keys(rawData).length === 0) {
    return res.status(400).json({ message: "Missing or empty JSON body." });
  }

  try {
    // FIX: Call the correct function name here as well.
    const summarized = await getLLMSummary(rawData);

    if (summarized && !summarized.fallback) {
      return res.status(200).json(summarized);
    } else {
      // This case handles the fallback response from the service
      return res.status(500).json({
        message: "LLM summarization failed.",
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Controller error:", error.message);
    return res.status(500).json({ message: "Internal LLM summarization error." });
  }
};