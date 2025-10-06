import axios from "axios";

export const getEventsFromTicketmaster = async (location, startDate, endDate) => {
  try {
    const apiKey = process.env.TICKETMASTER_KEY;

    const res = await axios.get("https://app.ticketmaster.com/discovery/v2/events.json", {
      params: {
        apikey: apiKey,
        city: location,
        startDateTime: `${startDate}T00:00:00Z`,
        endDateTime: `${endDate}T23:59:59Z`,
        size: 10,
      },
    });

    if (!res.data._embedded?.events) return [];

    return res.data._embedded.events.map((e) => ({
      source: "Ticketmaster",
      title: e.name,
      category: e.classifications?.[0]?.segment?.name || "general",
      start: e.dates?.start?.dateTime,
      end: e.dates?.end?.dateTime || e.dates?.start?.dateTime,
      location: e._embedded?.venues?.[0]?.name || location,
    }));
  } catch (err) {
    console.error("Ticketmaster Error:", err.message);
    return [];
  }
};
