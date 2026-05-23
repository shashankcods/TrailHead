import {
  itineraryGraph
} from "../langgraph/itineraryModification.graph.js";

import {
  enrichItinerary
} from "../utils/enrichItinerary.js";

export const modifyItineraryController =
  async (req, res) => {

    const result =
      await itineraryGraph.invoke({

        itinerary:
          req.body.itinerary,

        userMessage:
          req.body.userMessage,

        activities:
          req.body.activities,

        budget:
          req.body.budget,

        repairAttempts: 0,
      });

    const enrichedItinerary =
      enrichItinerary({

        itinerary:
          result.itinerary,

        activities:
          req.body.activities
    });

    return res.status(200).json({

      success: true,

      itinerary:
        enrichedItinerary,

      intent:
        result.intent
    });
};