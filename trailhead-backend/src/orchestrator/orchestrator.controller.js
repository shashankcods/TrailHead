import { orchestrateTripService } from "./orchestrator.service.js";

export const orchestrateTrip = async (req, res) => {
  console.log("✅ Received POST /api/orchestrator");
  console.log("📦 Request body:", req.body);

  try {
    const tripData = await orchestrateTripService(req.body);
    console.log("✅ Orchestrator service returned data");
    res.status(200).json(tripData);
  } catch (error) {
    console.error("❌ Orchestrator error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
