import { orchestrateTripService } from "./orchestrator.service.js";

export const orchestrateTrip = async (req, res) => {
  console.log("✅ Received POST /api/orchestrator");
  console.log("📦 Request body:", req.body);

  try {
    const tripData = await orchestrateTripService(req.body);
    if (tripData?.itinerary?.length > 0) {
      console.log("🧭 Sending LLM itinerary to frontend.");
      return res.status(200).json({
        summary: tripData.summaryText,
        itinerary: tripData.itinerary,
        llmFallback: tripData.llmFallback,
      });
    }

    // Otherwise fallback to your previous trimming logic
    if (tripData?.events?.events) {
      const before = tripData.events.events.length;
      tripData.events.events = tripData.events.events.slice(0, 4);
      console.log(`Trimmed events: ${before} → ${tripData.events.events.length}`);
    }

    if (tripData?.accommodation?.hotels) {
      const before = tripData.accommodation.hotels.length;
      tripData.accommodation.hotels = tripData.accommodation.hotels.slice(0, 4);
      console.log(`Trimmed hotels: ${before} → ${tripData.accommodation.hotels.length}`);
    }

    if (tripData?.food?.restaurants) {
      const before = tripData.food.restaurants.length;
      tripData.food.restaurants = tripData.food.restaurants.slice(0, 4);
      console.log(`Trimmed restaurants: ${before} → ${tripData.food.restaurants.length}`);
    }

    if (!tripData.reddit || tripData.reddit.error) {
      tripData.reddit = {
        insights: [
          {
            subreddit: "r/travel",
            title: "No Reddit data available",
            text: "Try again later for community insights.",
            upvotes: 0,
          },
        ],
      };
    }

    console.log("✅ Orchestrator service returned data (fallback mode)");
    res.status(200).json(tripData);
  } catch (error) {
    console.error("❌ Orchestrator error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
