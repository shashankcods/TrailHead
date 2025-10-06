import { orchestrateTripService } from "./orchestrator.service.js";

export const orchestrateTrip = async (req, res) => {
  try {
    const tripData = await orchestrateTripService(req.body);
    res.status(200).json(tripData);
  } 
  catch (error) {
    console.error("Orchestrator error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
