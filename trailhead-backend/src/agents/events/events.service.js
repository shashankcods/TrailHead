import { getEventsFromPredictHQ } from "./providers/predicthq.js";   // Fetches events from PredictHQ API
import { getEventsFromTicketmaster } from "./providers/ticketmaster.js"; // Fetches events from Ticketmaster API
// import { getEventsFromEventbrite } from "./providers/eventbrite.js"; // (Optional) Can be added later

export const getEvents = async (location, startDate, endDate) => {
  try {
    // Make parallel api requests
    const [phq, tm] = await Promise.all([
      getEventsFromPredictHQ(location, startDate, endDate),
      getEventsFromTicketmaster(location, startDate, endDate),
    //   getEventsFromEventbrite(location, startDate, endDate),
    ]);

    // Merge all events into a single array
    const allEvents = [...phq, ...tm];

    // Sort events chronologically based on start time
    allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

    // Return a summary object
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
