import { Trip } from "../models/trip.model.js";

export const createTripService = async (userId, tripData) => {
  // Auto-set status if not explicitly provided
  if (!tripData.status) {
    const startDate = tripData.plannerData?.trip?.start_date || tripData.startDate;
    const endDate = tripData.plannerData?.trip?.end_date || tripData.endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate) {
      const tripStartDate = new Date(startDate);
      tripStartDate.setHours(0, 0, 0, 0);
      
      if (endDate) {
        const tripEndDate = new Date(endDate);
        tripEndDate.setHours(0, 0, 0, 0);
        
        if (tripEndDate < today) {
          tripData.status = "completed";
        } else if (tripStartDate > today) {
          tripData.status = "upcoming";
        } else {
          tripData.status = "saved";
        }
      } else {
        if (tripStartDate > today) {
          tripData.status = "upcoming";
        } else {
          tripData.status = "saved";
        }
      }
    } else {
      tripData.status = "saved";
    }
  }
  
  const trip = await Trip.create({
    user: userId,
    ...tripData,
  });
  return trip;
};

export const getTripsService = async (userId) => {
  const trips = await Trip.find({ user: userId })
    .select("-plannerData")
    .sort({ createdAt: -1 });
  return trips;
};

export const getTripByIdService = async (userId, tripId) => {
  const trip = await Trip.findOne({ _id: tripId, user: userId });
  if (!trip) {
    throw new Error("Trip not found");
  }
  return trip;
};

export const updateTripService = async (userId, tripId, updateData) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: tripId, user: userId },
    updateData,
    { new: true }
  );
  if (!trip) {
    throw new Error("Trip not found");
  }
  return trip;
};

export const deleteTripService = async (userId, tripId) => {
  const trip = await Trip.findOneAndDelete({ _id: tripId, user: userId });
  if (!trip) {
    throw new Error("Trip not found");
  }
  return trip;
};
