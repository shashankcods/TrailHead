import axios from "axios";

export const getWeatherFromOpenMeteo = async (lat, lon, start_date, end_date) => {
  try {
    const params = {
      latitude: lat,
      longitude: lon,
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
      timezone: "auto",
    };

    if (start_date && end_date) {
      params.start_date = start_date;
      params.end_date = end_date;
    }

    console.log("Fetching forecast for:", params);

    const response = await axios.get("https://api.open-meteo.com/v1/forecast", { params });

    console.log("Forecast API Status:", response.status);

    const daily = response.data.daily;
    if (!daily || !daily.time) {
      throw new Error("Invalid response from Open-Meteo API");
    }

    const forecast = daily.time.map((date, i) => ({
      date,
      maxTemp: daily.temperature_2m_max[i],
      minTemp: daily.temperature_2m_min[i],
      rainChance: daily.precipitation_sum[i],
      condition: weatherCodeToText(daily.weathercode[i]),
    }));

    return { lat, lon, forecast };

  } catch (error) {
    console.error("Weather Service Error:", error.response?.status, error.response?.data || error.message);
    throw new Error("Failed to fetch weather data from Open-Meteo API");
  }
};

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