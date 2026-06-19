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

    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.5-flash"
    ];

    for (const model of modelsToTry) {
      try {

        console.log(`Extract intent trying model: ${model}`);

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
              model,

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
        console.log(`Extract intent success with model: ${model}`);

        return {

          ...state,

          intent
        };

      } catch (error) {

        console.error(
          `Extract Intent Error with ${model}:`,
          error.message
        );
        // Continue to next model if this one fails
      }
    }

    // If all models fail
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
};