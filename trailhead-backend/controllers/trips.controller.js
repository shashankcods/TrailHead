import {
  createTripService,
  getTripsService,
  getTripByIdService,
  updateTripService,
  deleteTripService,
} from "../services/trips.service.js";

export const createTrip = async (req, res) => {
  try {
    console.log("[saveTrip] user:", req.user);
    console.log("[saveTrip] body keys:", Object.keys(req.body || {}));
    console.log("[saveTrip] plannerData trip:", req.body?.plannerData?.trip);
    
    const userId = req.user.id;
    const tripData = req.body;

    if (
      !tripData.title ||
      !tripData.source ||
      !tripData.destination ||
      !tripData.startDate ||
      !tripData.endDate ||
      !tripData.tripDays ||
      !tripData.adults ||
      !tripData.plannerData
    ) {
      console.log("[saveTrip] Missing required fields", tripData);
      return res.status(400).json({ error: "Missing required fields" });
    }

    const trip = await createTripService(userId, tripData);
    console.log("[saveTrip] saved trip id:", trip?._id);
    return res.status(201).json({ message: "Trip saved successfully", trip });
  } catch (error) {
    console.error("Create Trip Error:", error);
    return res
      .status(400)
      .json({ error: error instanceof Error ? error.message : "Failed to create trip" });
  }
};

export const getTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const trips = await getTripsService(userId);
    return res.json({ message: "Trips retrieved successfully", trips });
  } catch (error) {
    console.error("Get Trips Error:", error);
    return res
      .status(400)
      .json({ error: error instanceof Error ? error.message : "Failed to get trips" });
  }
};

export const getTripById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const trip = await getTripByIdService(userId, id);
    return res.json({ message: "Trip retrieved successfully", trip });
  } catch (error) {
    console.error("Get Trip Error:", error);
    const status =
      error instanceof Error && error.message === "Trip not found" ? 404 : 400;
    return res
      .status(status)
      .json({ error: error instanceof Error ? error.message : "Failed to get trip" });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;
    const trip = await updateTripService(userId, id, updateData);
    return res.json({ message: "Trip updated successfully", trip });
  } catch (error) {
    console.error("Update Trip Error:", error);
    const status =
      error instanceof Error && error.message === "Trip not found" ? 404 : 400;
    return res
      .status(status)
      .json({ error: error instanceof Error ? error.message : "Failed to update trip" });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await deleteTripService(userId, id);
    return res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Delete Trip Error:", error);
    const status =
      error instanceof Error && error.message === "Trip not found" ? 404 : 400;
    return res
      .status(status)
      .json({ error: error instanceof Error ? error.message : "Failed to delete trip" });
  }
};
