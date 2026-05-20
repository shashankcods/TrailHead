import axios from "axios";
import APIError from "../utils/APIError.js";


// =========================
// Ticketmaster Events
// =========================

export const getEventsFromTicketmaster = async (

  location,

  startDate,

  endDate,

  limit = 10
) => {

  try {

    const apiKey =
      process.env.TICKETMASTER_KEY;

    const res =
      await axios.get(
        "https://app.ticketmaster.com/discovery/v2/events.json",
        {
          params: {

            apikey:
              apiKey,

            city:
              location,

            startDateTime:
              `${startDate}T00:00:00Z`,

            endDateTime:
              `${endDate}T23:59:59Z`,

            size:
              limit,
          },
        }
      );

    if (
      !res.data._embedded?.events
    ) {

      return [];
    }

    return res.data._embedded.events.map(
      (e) => ({

        source:
          "Ticketmaster",

        title:
          e.name,

        category:
          e.classifications?.[0]
            ?.segment?.name || "general",

        start:
          e.dates?.start?.dateTime,

        end:
          e.dates?.end?.dateTime
          || e.dates?.start?.dateTime,

        location:
          e._embedded?.venues?.[0]?.name
          || location,

        venue:
          e._embedded?.venues?.[0]?.name
          || null,

        city:
          e._embedded?.venues?.[0]?.city
            ?.name || null,

        country:
          e._embedded?.venues?.[0]?.country
            ?.name || null,

        image:
          e.images?.[0]?.url
          || null,

        status:
          e.dates?.status?.code
          || "unknown",

        ticketUrl:
          e.url || null,
      })
    );

  } catch (err) {

    console.error(
      "Ticketmaster Error:",
      err.response?.data
      || err.message
    );

    throw new APIError(
      500,
      "Failed to fetch events from Ticketmaster"
    );
  }
};


// =========================
// Main Events Service
// =========================

export const getEvents = async (

  location,

  startDate,

  endDate,

  limit = 10
) => {

  try {

    const events =
      await getEventsFromTicketmaster(

        location,

        startDate,

        endDate,

        limit
      );

    events.sort(
      (a, b) =>
        new Date(a.start)
        -
        new Date(b.start)
    );

    return {

      summary:
        `Fetched ${events.length} events for ${location}`,

      provider:
        "Ticketmaster",

      requestedResults:
        limit,

      totalResults:
        events.length,

      events,
    };

  } catch (err) {

    console.error(
      "Events Service Error:",
      err.message
    );

    throw new APIError(
      500,
      "Failed to fetch events"
    );
  }
};