import { getRouteFromORS } from "../agents/maps/maps.service.js";

export const orchestrateTripService = async (tripDetails) => {
  const { source, destination, startDate, endDate, budget } = tripDetails;

  const mapsData = await getRouteFromORS(source, destination);

  return {
    summary: "Trip plan generated successfully!",
    maps: mapsData,
    meta: {
      source,
      destination,
      startDate,
      endDate,
      budget
    }
  };
};