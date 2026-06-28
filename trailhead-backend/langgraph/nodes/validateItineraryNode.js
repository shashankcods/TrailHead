import {
  validateItinerary
} from "../../utils/validateItinerary.js";

export const validateItineraryNode = async (state) => {
  const activityMap = new Map(
    (state.activities ?? []).map((a) => [a.id ?? a.activityId, a])
  );

  const validationResult = validateItinerary({
    itinerary: state.itinerary,
    activityMap,
  });

  console.log(
    `[validateItineraryNode] repairAttempts=${state.repairAttempts ?? 0}, valid=${validationResult.valid}`
  );

  return {
    ...state,
    validationResult,
  };
};