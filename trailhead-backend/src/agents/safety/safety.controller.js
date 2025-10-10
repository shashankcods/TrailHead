import { getSafetyData } from "./safety.service.js";  // Import func from the service

export const getSafetyInfo = async (req, res) => {
  // Extract query parametes from request
  const { destination } = req.query;

  // Checking user's I/P
  try {
    if (!destination) {
        return res.status(400).json({ error: "Missing 'destination' query parameter" });
    }
    // Call the service to fetch route data
    const safetyData = await getSafetyData(destination);
    res.status(200).json(safetyData);
  } catch (error) {
    console.error("Safety Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
