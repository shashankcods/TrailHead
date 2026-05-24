import {
  validateItinerary
} from "../../utils/validateItinerary.js";

export const validateItineraryNode = async (state) => {
  const validationResult = validateItinerary({
    itinerary: state.itinerary,
    activities: state.activities,
  });

  console.log(
    `[validateItineraryNode] repairAttempts=${state.repairAttempts ?? 0}, valid=${validationResult.valid}`
  );

  return {
    ...state,
    validationResult,
  };
};