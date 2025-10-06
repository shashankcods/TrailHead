import { getWeatherFromOpenMeteo } from "./weather.service.js";

export const getWeather = async (req, res) => {
  const { destination, start_date, end_date } = req.query;

  try {
    if (!destination) {
      return res.status(400).json({ error: "Missing 'destination' query parameter" });
    }

    const weatherData = await getWeatherFromOpenMeteo(destination, start_date, end_date)

    res.status(200).json(weatherData);
    
  } catch (error) {
    console.error("Weather Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};