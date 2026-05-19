import axios from "axios";
import APIError from "../utils/ApiError.js";

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
    throw new APIError(500, "Failed to fetch events from PredictHQ");
  }
};

export const getEventsFromTicketmaster = async (location, startDate, endDate) => {
  try {
    const apiKey = process.env.TICKETMASTER_KEY;
    
    // Ticketmaster Discovery API endpoint
    const res = await axios.get("https://app.ticketmaster.com/discovery/v2/events.json", {
      params: {
        apikey: apiKey,
        city: location,
        startDateTime: `${startDate}T00:00:00Z`,
        endDateTime: `${endDate}T23:59:59Z`,
        size: 10,
      },
    });

    // If no events found, return an empty array
    if (!res.data._embedded?.events) return [];

    // Map response to a standard format
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
    throw new APIError(500, "Failed to fetch events from Ticketmaster");
  }
};

// export const getEventsFromEventbrite = async (location, startDate, endDate) => {
//   try {
//     const query = `
//       query SearchEvents($q: String!) {
//         events(q: $q, first: 20) {
//           edges {
//             node {
//               name { text }
//               start { utc }
//               end { utc }
//               venue {
//                 name
//                 address { localized_address_display }
//               }
//             }
//           }
//         }
//       }
//     `;

//     const res = await axios.post("https://www.eventbrite.com/api/v3/graphql/", {
//       query,
//       variables: { q: location },
//     }, {
//       headers: { "Content-Type": "application/json" },
//     });

//     const edges = res.data?.data?.events?.edges || [];
//     if (!edges.length) {
//       console.warn(`No Eventbrite GraphQL events found for ${location}`);
//       return [];
//     }

//     return edges.map(({ node }) => ({
//       source: "Eventbrite (GraphQL)",
//       title: node.name?.text,
//       category: "general",
//       start: node.start?.utc,
//       end: node.end?.utc,
//       location: node.venue?.name || node.venue?.address?.localized_address_display || location,
//     }));
//   } catch (err) {
//     console.error("Eventbrite GraphQL Error:", err.message);
//     return [];
//   }
// };

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
    throw new APIError(500, "Failed to fetch events");
  }
};