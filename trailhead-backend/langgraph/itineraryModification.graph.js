import {
  StateGraph,
  END
} from "@langchain/langgraph";

import {
  extractIntentNode
} from "./nodes/extractIntent.js";

import {
  modifyItineraryNode
} from "./nodes/modifyItinerary.js";

import {
  validateItineraryNode
} from "./nodes/validateItinerary.js";

import {
  repairItineraryNode
} from "./nodes/repairItinerary.js";

const itineraryState = {

  itinerary: null,

  userMessage: "",

  intent: null,

  validationResult: null,

  activities: []
};

const workflow =
  new StateGraph({

    channels:
      itineraryState
  });

workflow.addNode(
  "extractIntent",
  extractIntentNode
);

workflow.addNode(
  "modifyItinerary",
  modifyItineraryNode
);

workflow.addNode(
  "validateItinerary",
  validateItineraryNode
);

workflow.addNode(
  "repairItinerary",
  repairItineraryNode
);

workflow.setEntryPoint(
  "extractIntent"
);

workflow.addEdge(
  "extractIntent",
  "modifyItinerary"
);

workflow.addEdge(
  "modifyItinerary",
  "validateItinerary"
);

workflow.addConditionalEdges(

  "validateItinerary",

  (state) => {

    if (
      state.validationResult.valid
    ) {
      return END;
    }

    return "repairItinerary";
  }
);

workflow.addEdge(
  "repairItinerary",
  "validateItinerary"
);

export const itineraryGraph =
  workflow.compile();