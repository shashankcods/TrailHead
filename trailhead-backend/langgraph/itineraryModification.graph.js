import { StateGraph, END } from "@langchain/langgraph";

import { extractIntentNode } from "./nodes/extractIntent.js";
import { modifyItineraryNode } from "./nodes/modifyItinerary.js";
import { validateItineraryNode } from "./nodes/validateItineraryNode.js";
import { repairItineraryNode } from "./nodes/repairItineraryNode.js";

const MAX_REPAIR_ATTEMPTS = 3;

const workflow = new StateGraph({
  channels: {
    itinerary: null,
    userMessage: "",
    activities: [],
    budget: null,
    intent: null,
    validationResult: null,
    repairAttempts: 0,
  },
});

workflow.addNode("extractIntent", extractIntentNode);
workflow.addNode("modifyItinerary", modifyItineraryNode);
workflow.addNode("validateItinerary", validateItineraryNode);
workflow.addNode("repairItinerary", repairItineraryNode);

workflow.setEntryPoint("extractIntent");

workflow.addEdge("extractIntent", "modifyItinerary");
workflow.addEdge("modifyItinerary", "validateItinerary");

workflow.addConditionalEdges("validateItinerary", (state) => {
  if (state.validationResult?.valid) {
    return END;
  }

  const attempts = state.repairAttempts ?? 0;

  if (attempts >= MAX_REPAIR_ATTEMPTS) {
    console.error(
      "[itineraryGraph] Max repair attempts reached:",
      state.validationResult?.errors
    );
    return END;
  }

  return "repairItinerary";
});

workflow.addEdge("repairItinerary", "validateItinerary");

export const itineraryGraph = workflow.compile({
  recursionLimit: 12,
});

export { MAX_REPAIR_ATTEMPTS };
