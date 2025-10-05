import { getRouteFromORS } from "./maps.service.js";

export const getRoute = async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Missing 'from' or 'to' query parameters" });
  }

  try {
    const routeData = await getRouteFromORS(from, to);
    res.status(200).json(routeData);
  } catch (error) {
    console.error("Maps Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
