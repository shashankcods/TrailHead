import axios from "axios";

export const getEventsFromPredictHQ = async (location, startDate, endDate) => {
  try {
    const geo = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
      params: { name: location, count: 1 },
    });

    if (!geo.data.results?.length) return [];

    const { latitude, longitude } = geo.data.results[0];
    const token = process.env.PREDICTHQ_TOKEN;

    const res = await axios.get("https://api.predicthq.com/v1/events/", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        within: `60km@${latitude},${longitude}`,
        category: "public-holidays,festivals",
        start_gte: `${startDate}T00:00:00Z`,
        start_lte: `${endDate}T23:59:59Z`,
        limit: 10,
      },
    });

    return res.data.results.map((e) => ({
      source: "PredictHQ",
      title: e.title,
      category: e.category,
      start: e.start,
      end: e.end,
      location: e.entities?.[0]?.name || location,
    }));
  } catch (err) {
    console.error("PredictHQ Error:", err.message);
    return [];
  }
};
