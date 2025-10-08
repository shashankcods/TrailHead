import { getRouteFromORS } from "../agents/maps/maps.service.js";
import { getWeatherFromOpenMeteo } from "../agents/weather/weather.service.js";
import { getRestaurants } from "../agents/food/food.service.js";
import { getEvents } from "../agents/events/events.service.js";
import { getHotelsFromBooking } from "../agents/accommodation/accommodation.service.js";

export const orchestrateTripService = async (tripDetails) => {
  const { source, destination, startDate, endDate, budget } = tripDetails;

  try{
    const [mapsData, weatherData, foodData, eventsData, accommodationData] = await Promise.all([
      getRouteFromORS(source, destination),
      getWeatherFromOpenMeteo(destination, startDate, endDate),
      getRestaurants(destination),
      getEvents(destination, startDate, endDate),
      getHotelsFromBooking(destination, startDate, endDate, budget),
    ]);

    return {
      summary: "Trip plan generated successfully!",
      maps: mapsData,
      weather: weatherData,
      food: foodData,
      events: eventsData,
      accommodatoins: accommodationData,
      meta: {
        source,
        destination,
        startDate,
        endDate,
        budget
      },
    };
  } 
  catch(error){
    console.error("Error in orchestrateTripService: ", error.message);
    throw error;
  }  
};