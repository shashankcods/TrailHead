import { getSafetyData } from "../services/safety.service.js";  // Import func from the service
import APIResponse from "../utils/APIResponse.js"
import asyncHandlder from "../utils/asyncHandler.js"

export const getSafetyInfo = asyncHandlder(async (req, res) => {
  // Extract query parametes from request
  const { destination } = req.query;

  // Checking user's I/P
  if (!destination) {
    return res.status(400).json({ error: "Missing 'destination' query parameter" });
  }
  // Call the service to fetch route data
  const safetyData = await getSafetyData(destination);
  res.status(200).json(new APIResponse(200, safetyData, "Safety data fetched successfully"));

});
