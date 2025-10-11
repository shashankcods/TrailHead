import { getFlights } from "./flights.service.js";

export const getFlightsData = async (req, res) => {
    const { source, destination, start_date, end_date } = req.query;

    try {
        if (!source || !destination || !start_date || !end_date) {
            return res.status(400).json({ error: "Missing 'destination' query parameter" });
        }

        const data = await getFlights(source, destination, start_date, end_date);
        res.status(200).json(data);
    } catch (error) {
        console.error("Flights Controller Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};