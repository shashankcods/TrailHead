import { getEventsFromPredictHQ } from "./providers/predicthq.js";
import { getEventsFromTicketmaster } from "./providers/ticketmaster.js";
// import { getEventsFromEventbrite } from "./providers/eventbrite.js";

export const getEvents = async (location, startDate, endDate) => {
  try {
    const [phq, tm] = await Promise.all([
      getEventsFromPredictHQ(location, startDate, endDate),
      getEventsFromTicketmaster(location, startDate, endDate),
    //   getEventsFromEventbrite(location, startDate, endDate),
    ]);

    const allEvents = [...phq, ...tm];
    allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    return {
      summary: `Fetched ${allEvents.length} events for ${location}`,
      provider: "PredictHQ + Ticketmaster",
      events: allEvents,
    };
  } catch (err) {
    console.error("Events Service Error:", err.message);
    throw err;
  }
};
