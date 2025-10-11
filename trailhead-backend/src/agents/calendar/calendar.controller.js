import { generateCalendar } from "./calendar.service.js";

export const createCalendar = async (req, res) => {
  const { destination, startDate, endDate } = req.body;

  try {
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const result = await generateCalendar(destination, startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Calendar Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
