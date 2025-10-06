import { getRestaurants } from "./food.service.js";

export const getFoodOptions = async (req, res) => {
    const { destination } = req.query;

    try {
        if (!destination) {
            return res.status(400).json({ error: "Missing 'destination' query parameter" });
        }

        const data = await getRestaurants(destination);
        res.status(200).json(data);
    } catch (error) {
        console.error("Food Controller Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};