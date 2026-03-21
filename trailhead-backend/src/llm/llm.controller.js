// src/llm/llm.controller.js
import { summarizeTripLLM } from "./llm.service.js";

export const summarizeTrip = async (req, res) => {
  console.log("✅ /api/llm/summarize endpoint hit");

  const rawData = req.body;
  if (!rawData || Object.keys(rawData).length === 0) {
    return res.status(400).json({ message: "Missing or empty JSON body." });
  }

  try {
    const summarized = await summarizeTripLLM(rawData);
    if (summarized) {
      return res.status(200).json(summarized);
    } else {
      return res.status(200).json({
        message: "LLM summarization failed. Returning raw data.",
        fallback: true,
        data: rawData
      });
    }
  } catch (error) {
    console.error("Controller error:", error.message);
    return res.status(500).json({ message: "Internal LLM summarization error." });
  }
};
