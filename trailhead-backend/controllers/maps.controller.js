import { getRouteFromORS, getCityAutocomplete } from "../services/maps.service.js";  // Import func from the service
import APIResponse from "../utils/APIResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

export const getRoute = asyncHandler(async (req, res) => {
  // Extract query parametes from request
  const { from, to } = req.query;

  // Checking user's I/P
  if (!from || !to) {
    return res.status(400).json({ error: "Missing 'from' or 'to' query parameters" });
  }

  // Call the service to fetch route data
  const routeData = await getRouteFromORS(from, to);
  res.status(200).json(new APIResponse(200, routeData, "Route data fetched successfully"));

});

export const autocompleteCity = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }

  const suggestions = await getCityAutocomplete(query);
  res.status(200).json(new APIResponse(200, suggestions, "Autocomplete suggestions fetched successfully"));
});
