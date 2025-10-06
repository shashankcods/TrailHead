import { getEvents } from "./events.service.js";

export const fetchEvents = async (req, res) => {
  try {
    const { location, startDate, endDate } = req.query;

    if (!location || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const data = await getEvents(location, startDate, endDate);
    res.status(200).json(data);
  } catch (err) {
    console.error("Events Controller Error:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};
