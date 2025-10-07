import { getHotelsFromBooking } from "./accommodation.service.js";

export const getAccommodation = async (req, res) => {
  const { city, checkin_date, checkout_date } = req.query;

  if (!city || !checkin_date || !checkout_date)
    return res.status(400).json({ error: "Missing required parameters" });

  try {
    const data = await getHotelsFromBooking(city, checkin_date, checkout_date);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
