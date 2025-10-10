import axios from "axios";

// Main function: Fetches weather forecast for a given destination (and optional date range)
// Uses Open-Meteo’s free APIs for both geocoding and weather forecast data
export const getWeatherFromOpenMeteo = async (destination, start_date, end_date) => {
  try {
    // Step 1: Convert destination name into latitude & longitude (geocoding)
    const geoUrl = "https://api.openrouteservice.org/geocode/search";
    const geoRes = await axios.get(geoUrl, {
      params: {
        api_key: process.env.ORS_API_KEY,
        text: destination,
      },
    });

    const location = geoRes.data.features?.[0];

    // If the API couldn’t find a location, stop and throw an error
    if (!location) {
      throw new Error("Location not found");
    }

    // Extract key details from the geocoding response
    const [longitude, latitude] = location.geometry.coordinates;
    const label = location.properties.label || destination;
    const country = label.split(",").pop().trim();

    console.log(`Geocoded ${destination} → ${latitude}, ${longitude}`)

    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(today.getDate() + 16);
    const start = new Date(start_date);
    const end = new Date(end_date);

    let forecast = [];

    //Case 1: Entire range within 16 days
    if (end <= cutoff) {
      forecast = await getForecast(latitude, longitude, start_date, end_date);
    }

    //Case 2: Entire range beyond 16 days
    else if (start > cutoff) {
      forecast = await getClimateAverages(latitude, longitude, start_date, end_date);
    }

    //Case 3: Mixed
    else {
      const cutoffDate = cutoff.toISOString().split("T")[0];
      const forecastPart = await getForecast(latitude, longitude, start_date, cutoffDate);
      const climatePart = await getClimateAverages(latitude, longitude, cutoffDate, end_date);
      forecast = [...forecastPart, ...climatePart];
    }

    // Return the final structured forecast along with basic location info
    return { destination, country, forecast };

  } catch (error) {
    console.error("Weather Service Error:", error.response?.status, error.response?.data || error.message);
    throw new Error("Failed to fetch weather data from Open-Meteo API");
  }
};


async function getForecast(latitude, longitude, start_date, end_date){
  const params = {
    latitude,
    longitude,
    start_date,
    end_date,
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
    timezone: "auto",
  };

  const res = await axios.get("https://api.open-meteo.com/v1/forecast", { params });
  const daily = res.data.daily;

  return daily.time.map((date, i) => ({
    date,
    maxTemp: daily.temperature_2m_max[i],
    minTemp: daily.temperature_2m_min[i],
    rainAmount: daily.precipitation_sum[i],
    condition: weatherCodeToText(daily.weathercode[i]),
  }));
}

async function getClimateAverages(latitude, longitude, start_date, end_date) {
  const params = {
    latitude,
    longitude,
    start_date,
    end_date,
    models: "MRI_AGCM3_2_S",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum"
  };

  try {
    const res = await axios.get("https://climate-api.open-meteo.com/v1/climate", { params });
    const daily = res.data.daily;

    if (!daily || !daily.time) throw new Error("Invalid climate response");


    return daily.time.map((date, i) => {
      const maxTemp = daily.temperature_2m_max[i];
      const minTemp = daily.temperature_2m_min[i];
      const rainAmount = daily.precipitation_sum[i];
      const code = inferWeatherCode(maxTemp, minTemp, rainAmount);

      return {
        date,
        maxTemp,
        minTemp,
        rainAmount,
        condition: weatherCodeToText(code),
      };
    });
  } catch (err) {
    console.error("Climate API error:", err.response?.status, err.response?.data || err.message);
    return [];
  }
}

// Helper function: Converts numeric weather codes into human-readable descriptions
function weatherCodeToText(code) {
  const codes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
  };
  return codes[code] || "Unknown";
}

function inferWeatherCode(maxTemp, minTemp, rainAmount) {
  if (rainAmount > 50) return 82;       // Violent rain showers
  if (rainAmount > 20) return 81;       // Moderate rain showers
  if (rainAmount > 10) return 65;       // Heavy rain
  if (rainAmount > 5)  return 63;       // Moderate rain
  if (rainAmount > 1)  return 61;       // Light rain
  if (maxTemp < 5)     return 75;       // Heavy snow (cold regions)
  if (maxTemp < 10)    return 73;       // Moderate snow
  if (maxTemp < 15)    return 3;        // Cloudy
  if (maxTemp < 25)    return 2;        // Partly cloudy
  return 0; 
}