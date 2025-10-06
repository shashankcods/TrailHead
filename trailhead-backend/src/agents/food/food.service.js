import axios from "axios";

export const getRestaurants = async (destination) => {
    try {
        const geoRes = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
            params: { name: destination },
        });
        const location = geoRes.data.results?.[0];
        if (!location) throw new Error("Destination not found");

        const { latitude, longitude, country } = location;

        const placesUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
        const params = {
            location: `${latitude},${longitude}`,
            radius: 5000,
            type: "restaurant",
            key: process.env.GOOGLE_PLACES_API_KEY,
        };

        const res = await axios.get(placesUrl, { params });
        let results = res.data.results || [];

        if (results.length == 0) {
            return { message: "No restaurants found for this location."};
        }

        results = results
            .filter((r) => r.rating)
            .sort((a, b) => {
                if (b.rating === a.rating) {
                return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
                }
                return b.rating - a.rating;
            })
            .slice(0, 10);

        const restaurants = results.map((r) => ({
            name: r.name,
            address: r.vicinity,
            rating: r.rating ?? "N/A",
            totalReviews: r.user_ratings_total ?? 0,
            priceLevel: r.price_level ?? "N/A",
            googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
        }));

        return {
            destination,
            country: country || "Unknown",
            topCount: restaurants.length,
            restaurants,
        };
    } catch (error) {
        console.error("Food Service Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch restaurants data");
    }
};