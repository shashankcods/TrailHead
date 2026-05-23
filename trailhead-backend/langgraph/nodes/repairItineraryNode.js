import { repairItinerary } from "../../utils/repairItinerary.js";

export const repairItineraryNode = async (state) => {
  const attempts = (state.repairAttempts ?? 0) + 1;

  console.log(
    `[repairItineraryNode] repair attempt ${attempts} of 3`
  );

  const repaired = repairItinerary({
    itinerary: state.itinerary,
    activities: state.activities,
  });

  return {
    ...state,
    itinerary: repaired,
    repairAttempts: attempts,
  };
};
