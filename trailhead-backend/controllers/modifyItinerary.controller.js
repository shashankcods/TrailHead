import {
  itineraryGraph
} from "../langgraph/itineraryModification.graph.js";

import {
  enrichItinerary
} from "../utils/enrichItinerary.js";

export const modifyItineraryController = async (req, res) => {
  try {
    const originalItinerary = req.body.itinerary;

    const result = await itineraryGraph.invoke({
      itinerary: req.body.itinerary,
      userMessage: req.body.userMessage,
      activities: req.body.activities,
      budget: req.body.budget,
      repairAttempts: 0,
    });

    if (result.validationResult?.valid === false) {
      return res.status(200).json({
        success: true,
        itinerary: originalItinerary,
        intent: result.intent ?? {},
        message: "Sorry, I couldn't apply that change without creating scheduling conflicts. Try a more specific request.",
      });
    }

    const activityMap = new Map(
      (req.body.activities ?? []).map((a) => [a.id ?? a.activityId, a])
    );

    const enrichedItinerary = enrichItinerary({
      itinerary: result.itinerary,
      activityMap,
    });

    const intent = result.intent ?? {};
    const couldNotUnderstand = !intent.action || intent.action === "unknown";

    return res.status(200).json({
      success: true,
      itinerary: enrichedItinerary,
      intent,
      message: couldNotUnderstand
        ? "Sorry, I couldn't understand that request. Try something like 'remove the museum visit' or 'add nightlife on day 2'."
        : undefined,
    });
  } catch (err) {
    console.error("[modifyItinerary] LangGraph error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to modify itinerary",
    });
  }
};