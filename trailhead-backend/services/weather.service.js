import axios from "axios";
import APIError from "../utils/APIError.js";
import { resolveDestinationGeo } from "../utils/geocode.js";

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
    maxTemp: Math.round(daily.temperature_2m_max?.[i] ?? 0),
    minTemp: Math.round(daily.temperature_2m_min?.[i] ?? 0),
    rainAmount: daily.precipitation_sum?.[i] ?? 0,
    condition: getWeatherCondition(daily.weathercode?.[i]),
  }));
};

export const getWeatherFromOpenMeteo = async (
  destination,
  start_date,
  end_date,
  latitude = null,
  longitude = null,
  country = null
) => {
  try {
    const geo = await resolveDestinationGeo(
      destination,
      latitude,
      longitude,
      country
    );

    const {
      latitude: lat,
      longitude: lng,
      country: resolvedCountry,
    } = geo;

    // default to next 7 days if dates are not provided
    const today = new Date();
    const defaultStart = new Date(today);
    const defaultEnd = new Date(today);
    defaultEnd.setDate(defaultEnd.getDate() + 6);

    const finalStartDate =
      start_date || defaultStart.toISOString().split("T")[0];
    const finalEndDate =
      end_date || defaultEnd.toISOString().split("T")[0];
    
    const maxForecastDate =
      new Date();

    maxForecastDate.setDate(
      maxForecastDate.getDate() + 15
    );

    const safeEndDate =
      new Date(finalEndDate)
      >
      maxForecastDate

      ? maxForecastDate
          .toISOString()
          .split("T")[0]

      : finalEndDate;

    const forecast = await getForecast(
      lat,
      lng,
      finalStartDate,
      safeEndDate
    );

    return {
      destination,
      country: resolvedCountry,
      forecast,
    };
    
  } catch (error) {
      console.error(
        "Weather Error:",
        error.response?.data
        || error.message
      );

      throw new APIError(
        500,
        "Weather Service Failed"
      );
    }
};