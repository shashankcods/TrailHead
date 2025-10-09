import { getRedditAdvice } from "./reddit.service.js";
 
export const getTripAdvice = async (req, res) => {
    const { destination } = req.query;

    try {
        if (!destination) {
            return res.status(400).json({ error: "Missing 'destination' query parameter" });
        }

        const redditData = await getRedditAdvice(destination);
        res.status(200).json(redditData);
    } catch (error) {
        console.error("Reddit Controller Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};