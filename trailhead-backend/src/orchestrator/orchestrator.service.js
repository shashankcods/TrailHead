import { getRouteFromORS } from "../agents/maps/maps.service.js";
import { getWeatherFromOpenMeteo } from "../agents/weather/weather.service.js";

export const orchestrateTripService = async (tripDetails) => {
  const { source, destination, startDate, endDate, budget } = tripDetails;

  try{
    const mapsData = await getRouteFromORS(source, destination);
    const weatherData = await getWeatherFromOpenMeteo(destination, startDate, endDate);

    return {
      summary: "Trip plan generated successfully!",
      maps: mapsData,
      weather: weatherData,
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