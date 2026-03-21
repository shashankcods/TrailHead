// src/llm/llm.service.js
import axios from "axios";

const HOST = (process.env.OLLAMA_API || "http://127.0.0.1:11434/api/generate")
  .replace(/\/api\/generate$/i, "");
const OLLAMA_GENERATE = `${HOST}/api/generate`;

// Use your existing K_M model
const MODEL = process.env.OLLAMA_MODEL || "mistral:7b-instruct-q4_K_M";

// Give each day enough time (can be overridden via .env)
const PER_CALL_TIMEOUT = Number(process.env.LLM_TIMEOUT_MS || 120000);

// warm the model so the first real call doesn’t timeout
async function warmModel() {
  try {
    const t0 = Date.now();
    await axios.post(
      OLLAMA_GENERATE,
      {
        model: MODEL,
        prompt: "ok",
        stream: false,
        keep_alive: "30m",
        options: { num_predict: 1, temperature: 0 }
      },
      { timeout: 180000 }
    );
    console.log(`🔥 Model warm (keep_alive 30m) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } catch (e) {
    console.warn("Warmup failed (continuing):", e.message);
  }
}

// ---- helpers
function daysBetweenInclusive(startISO, endISO) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const ms = e - s;
  return Math.max(1, Math.floor(ms / (24 * 3600 * 1000)) + 1);
}
function dateAdd(baseISO, plusDays) {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + plusDays);
  return d.toISOString().slice(0, 10);
}
function buildCommonContext(raw) {
  return {
    meta: raw?.meta ?? {},
    maps: raw?.maps ?? {},
    food: (raw?.food?.restaurants || []).slice(0, 3),
    accommodation: (raw?.accommodation?.hotels || []).slice(0, 2),
    events: (raw?.events?.events || []).slice(0, 3),
    reddit: (raw?.reddit?.analyzedPosts || []).slice(0, 2)
  };
}
function dayPrompt(commonCtx, dayIndex, isoDate, totalDays) {
  const ctx = JSON.stringify(commonCtx);
  return `
You are TrailHead AI. Produce ONE day of a trip itinerary in STRICT JSON ONLY.

TOTAL_DAYS: ${totalDays}
THIS_DAY_NUMBER: ${dayIndex + 1}
THIS_DAY_DATE: ${isoDate}

Use INPUT_JSON for ideas (hotels for check-in, restaurants for meals, events/areas to explore, reddit tips). If something is missing, still produce sensible activities.

INPUT_JSON:
${ctx}

OUTPUT (JSON only, exact keys):
{
  "day": ${dayIndex + 1},
  "date": "${isoDate}",
  "title": "Theme of the day",
  "activities": [
    "Short sentence activity 1.",
    "Short sentence activity 2.",
    "Short sentence activity 3."
  ]
}
`.trim();
}

async function generateOneDay(prompt) {
  const { data } = await axios.post(
    OLLAMA_GENERATE,
    {
      model: MODEL,
      prompt,
      stream: false,          // simpler + predictable
      format: "json",         // force JSON
      keep_alive: "30m",
      // stop at the closing brace to avoid trailing chatter
      stop: ["\n}\n", "\n}"],
      options: {
        num_predict: 110,     // tighter cap → faster on q4_K_M
        temperature: 0.2,
        top_p: 0.9,
        num_ctx: 1536,
        repeat_penalty: 1.05
      }
    },
    { timeout: PER_CALL_TIMEOUT }
  );

  let out = data?.response;

  // Some builds return JSON text; parse it
  if (typeof out === "string") {
    // extract the first balanced JSON object if extra text sneaks in
    const s = out.trim();
    const i = s.indexOf("{");
    const j = s.lastIndexOf("}");
    if (i >= 0 && j > i) {
      try { out = JSON.parse(s.slice(i, j + 1)); } catch { /* fallthrough */ }
    }
  }

  if (!out || !Array.isArray(out.activities)) {
    throw new Error("Day JSON invalid");
  }
  return {
    day: out.day,
    date: out.date,
    title: out.title,
    activities: out.activities.slice(0, 5)
  };
}

export const summarizeTripLLM = async (rawData) => {
  try {
    console.log("🧠 LLM per-day (sequential) starting…");
    console.log(`🔗 ${OLLAMA_GENERATE} | model=${MODEL}`);

    await warmModel();

    const { startDate, endDate } = rawData?.meta || {};
    if (!startDate || !endDate) {
      return { fallback: true, itinerary: [], summary: "Missing startDate/endDate in meta." };
    }
    const totalDays = daysBetweenInclusive(startDate, endDate);
    const commonCtx = buildCommonContext(rawData);

    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const iso = dateAdd(startDate, i);
      const p = dayPrompt(commonCtx, i, iso, totalDays);
      const t0 = Date.now();
      try {
        const d = await generateOneDay(p);
        console.log(`✅ Day ${i + 1} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
        days.push(d);
      } catch (e) {
        console.warn(`⚠️ Day ${i + 1} generation failed: ${e.message}`);
        days.push({
          day: i + 1,
          date: iso,
          title: `Day ${i + 1}`,
          activities: ["Explore local sights.", "Try a recommended café.", "Evening stroll."]
        });
      }
      // small breather to avoid thrashing (optional)
      await new Promise(r => setTimeout(r, 150));
    }

    const summary =
      `${totalDays}-day trip from ${rawData?.meta?.source || "origin"} ` +
      `to ${rawData?.meta?.destination || "destination"}. ` +
      `Includes highlights, meals, and evening wind-downs.`;

    return { summary, itinerary: days };
  } catch (err) {
    console.error("💀 LLM summarization failed:", err.code || err.message);
    return { fallback: true, itinerary: [], summary: "Summarization failed." };
  }
};
