import { getRouteFromORS } from "./maps.service.js";  // Import func from the service

export const getRoute = async (req, res) => {
  // Extract query parametes from request
  const { from, to } = req.query;

  // Checking user's I/P
  if (!from || !to) {
    return res.status(400).json({ error: "Missing 'from' or 'to' query parameters" });
  }

  try {
    // Call the service to fetch route data
    const routeData = await getRouteFromORS(from, to);
    res.status(200).json(routeData);
  } catch (error) {
    console.error("Maps Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
