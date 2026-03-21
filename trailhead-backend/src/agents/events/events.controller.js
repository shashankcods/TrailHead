import { getEvents } from "./events.service.js";

export const fetchEvents = async (req, res) => {
  try {
    // Extract query parameters from request URL
    const { location, startDate, endDate } = req.query;

    // Input validation — all the  3 parameters are mandatory
    if (!location || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Call the events service to fetch event data
    const data = await getEvents(location, startDate, endDate);
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Events Controller Error:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};