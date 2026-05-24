import {
  GoogleGenAI
} from "@google/genai";

import {
  extractIntentPrompt
} from "../extractIntent.prompt.js";

import { ModifyIntentSchema } from "../../models/modifyIntent.schema.js";

const ai =
  new GoogleGenAI({

    apiKey:
      process.env
        .GEMINI_API_KEY
});

export const extractIntentNode =
  async (state) => {

    try {

      const compactActivities =
        state.activities.map((a) => ({

          id: a.id,

          title: a.title,

          category: a.category,

          estimatedCost:
            a.estimatedCost,

          sourceType:
            a.sourceType
      }));

      const prompt = `

${extractIntentPrompt}

CURRENT ITINERARY:
${JSON.stringify(state.itinerary)}

AVAILABLE ACTIVITIES:
${JSON.stringify(compactActivities)}

BUDGET:
${JSON.stringify(state.budget)}

USER REQUEST:
${state.userMessage}

`;

      const response =
        await ai.models.generateContent({

          model:
            "gemini-2.5-flash",

          contents:
            prompt
      });

      const text =
        response
          .candidates?.[0]
          ?.content?.parts?.[0]
          ?.text || "";

      console.log(
        "RAW GEMINI:",
        text
      );

      const cleaned =
        text
          .replace(
            /```json\s*/gi,
            ""
          )
          .replace(
            /```\s*/g,
            ""
          )
          .trim();

      console.log(
        "CLEANED:",
        cleaned
      );

      const parsed =
        JSON.parse(cleaned);

      const intent =
        ModifyIntentSchema.parse(
          parsed
      );

      return {

        ...state,

        intent
      };

    } catch (error) {

      console.error(
        "Intent Extraction Error:",
        error.message
      );

      return {

        ...state,

        intent: {

          action:
            "unknown",

          day: null,

          targetActivityId:
            null,

          targetType:
            null
        }
      };
    }
};