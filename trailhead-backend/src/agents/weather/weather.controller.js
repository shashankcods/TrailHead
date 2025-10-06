import axios from "axios";
import { getWeatherFromOpenMeteo } from "./weather.service.js";

export const getWeather = async (req, res) => {
    const { destination, start_date, end_date } = req.query;

    try {
        if (!destination) {
          return res.status(400).json({ error: "Missing 'destination' query parameter" });
        }

        const geoUrl = "https://geocoding-api.open-meteo.com/v1/search";
        const geoRes = await axios.get(geoUrl, { params: {name: destination } });
        const location = geoRes.data.results?.[0];

        if (!location){
          return res.status(400).json({ error: "Location not found" });
        }

        const latitude = location.latitude;
        const longitude = location.longitude;
        const country = location.country || "";

        console.log(`Geocoded ${destination} -> ${latitude}, ${longitude}`);

        const weatherData = await getWeatherFromOpenMeteo(latitude, longitude, start_date, end_date);
        res.status(200).json({destination, country, forecast: weatherData.forecast,});
        
    } catch (error) {
        console.error("Weather Controller Error: ", error.message);
        res.status(500).json({ error: error.message });
    };
};