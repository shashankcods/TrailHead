import axios from "axios";

const getWeatherCondition = (code) => {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
  };

  return weatherCodes[code] || "Unknown";
};

const getForecast = async (latitude, longitude, start_date, end_date) => {
  const weatherUrl = "https://api.open-meteo.com/v1/forecast";

  const params = {
    latitude,
    longitude,
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
    timezone: "auto",
    start_date,
    end_date,
  };

  const weatherRes = await axios.get(weatherUrl, { params });
  const daily = weatherRes.data.daily;

  return daily.time.map((date, i) => ({
    date,
    maxTemp: daily.temperature_2m_max?.[i] ?? 0,
    minTemp: daily.temperature_2m_min?.[i] ?? 0,
    rainAmount: daily.precipitation_sum?.[i] ?? 0,
    condition: getWeatherCondition(daily.weathercode?.[i]),
  }));
};

export const getWeatherFromOpenMeteo = async (destination, start_date, end_date) => {
  try {
    const geoUrl = "https://api.openrouteservice.org/geocode/search";
    const geoRes = await axios.get(geoUrl, {
      params: {
        api_key: process.env.ORS_API_KEY,
        text: destination,
      },
    });

    const location = geoRes.data.features?.[0];
    if (!location) throw new Error("Location not found");

    const [longitude, latitude] = location.geometry.coordinates;
    const label = location.properties.label || destination;
    const country = label.split(",").pop().trim();

    console.log(`🌦️ Geocoded ${destination} → ${latitude}, ${longitude}`);

    // default to next 7 days if dates are not provided
    const today = new Date();
    const defaultStart = new Date(today);
    const defaultEnd = new Date(today);
    defaultEnd.setDate(defaultEnd.getDate() + 6);

    const finalStartDate =
      start_date || defaultStart.toISOString().split("T")[0];
    const finalEndDate =
      end_date || defaultEnd.toISOString().split("T")[0];

    const forecast = await getForecast(
      latitude,
      longitude,
      finalStartDate,
      finalEndDate
    );

    return {
      destination,
      country,
      forecast,
    };
  } catch (error) {
    console.error("Weather Service Error:", error.response?.status, error.response?.data || error.message);

    return {
      destination,
      country: "Unknown",
      forecast: [
        {
          date: new Date().toISOString(),
          maxTemp: 0,
          minTemp: 0,
          rainAmount: 0,
          condition: "Unavailable",
        },
      ],
    };
  }
};