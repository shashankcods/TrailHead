import { repairItinerary } from "../../utils/repairItinerary.js";

export const repairItineraryNode = async (state) => {
  const attempts = (state.repairAttempts ?? 0) + 1;

  console.log(
    `[repairItineraryNode] repair attempt ${attempts} of 3`
  );

  const activityMap = new Map(
    (state.activities ?? []).map((a) => [a.id ?? a.activityId, a])
  );

  const repaired = repairItinerary({
    itinerary: state.itinerary,
    activities: state.activities,
    activityMap,
  });

  return {
    ...state,
    itinerary: repaired,
    repairAttempts: attempts,
  };
};
