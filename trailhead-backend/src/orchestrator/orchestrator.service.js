import axios from "axios";
// Set a global timeout for all axios calls (10 seconds)
axios.defaults.timeout = 10000;

// Import all agent services
import { getRouteFromORS } from "../agents/maps/maps.service.js";
import { getWeatherFromOpenMeteo } from "../agents/weather/weather.service.js";
import { getRestaurants } from "../agents/food/food.service.js";
import { getEvents } from "../agents/events/events.service.js";
import { getHotelsFromBooking } from "../agents/accommodation/accommodation.service.js";
import { getRedditAdvice } from "../agents/reddit/reddit.service.js";

export const orchestrateTripService = async (tripDetails) => {
  const { source, destination, startDate, endDate, budget } = tripDetails;

  console.log("Orchestrator started for trip:", source, "→", destination);

  try {
    // Run all agents in parallel safely
    const results = await Promise.allSettled([
      getRouteFromORS(source, destination),
      getWeatherFromOpenMeteo(destination, startDate, endDate),
      getRestaurants(destination),
      getEvents(destination, startDate, endDate),
      getHotelsFromBooking(destination, startDate, endDate),
      getRedditAdvice(destination)
    ]);

    // Extract each result safely
    const [mapsRes, weatherRes, foodRes, eventsRes, accommodationRes, redditRes] = results;
      getHotelsFromBooking(destination, startDate, endDate)
    ]);

    // Extract each result safely
    const [mapsRes, weatherRes, foodRes, eventsRes, accommodationRes] = results;

    const mapsData =
      mapsRes.status === "fulfilled"
        ? mapsRes.value
        : { error: mapsRes.reason?.message || "Maps agent failed" };

    const weatherData =
      weatherRes.status === "fulfilled"
        ? weatherRes.value
        : { error: weatherRes.reason?.message || "Weather agent failed" };

    const foodData =
      foodRes.status === "fulfilled"
        ? foodRes.value
        : { error: foodRes.reason?.message || "Food agent failed" };

    const eventsData =
      eventsRes.status === "fulfilled"
        ? eventsRes.value
        : { error: eventsRes.reason?.message || "Events agent failed" };

    const accommodationData =
      accommodationRes.status === "fulfilled"
        ? accommodationRes.value
        : { error: accommodationRes.reason?.message || "Accommodation agent failed" };

    const redditData=
      redditRes.status === "fulfilled"
        ? redditRes.value
        : { error: redditRes.reason?.message || "Reddit agent failed" };

    // Combine all agent data into one unified JSON response
    const response = {
      summary: "Trip plan generated successfully!",
      maps: mapsData,
      weather: weatherData,
      food: foodData,
      events: eventsData,
      accommodation: accommodationData,
      reddit: redditData,
      meta: {
        source,
        destination,
        startDate,
        endDate,
        budget
      }
    };

    console.log("Orchestrator finished successfully!");
    return response;
  } catch (error) {
    console.error("Orchestrator fatal error:", error.message);
    throw new Error("Orchestrator failed internally: " + error.message);
  }
};
