import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import GradientBackground from "@/components/GradientBackground";
import { getTrips, deleteTrip, type Trip } from "@/api/trips";
import { Trash2 } from "lucide-react";

const TripsPage: React.FC = () => {
  const { isAuthenticated, accessToken, isLoading } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
      return;
    }

    if (isAuthenticated && accessToken) {
      fetchTrips();
    }
  }, [isLoading, isAuthenticated, accessToken, navigate]);

  const fetchTrips = async () => {
    if (!accessToken) return;
    
    try {
      setIsLoadingTrips(true);
      const data = await getTrips(accessToken);
      setTrips(data.trips);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!accessToken) return;
    
    setDeletingTripId(tripId);
    
    try {
      await deleteTrip(accessToken, tripId);
      setTrips(trips.filter(t => t._id !== tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trip");
    } finally {
      setDeletingTripId(null);
    }
  };

  const handleViewResults = (trip: Trip) => {
    navigate("/results", { state: { plannerData: trip.plannerData, savedTripId: trip._id } });
  };

  const handleViewItinerary = (trip: Trip) => {
    navigate("/itinerary", { state: { plannerData: trip.plannerData, savedTripId: trip._id } });
  };

  if (isLoading || isLoadingTrips) {
    return (
      <GradientBackground>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-black dark:text-white">Loading...</p>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-black dark:text-white">
        <Navbar />
        <main className="flex-1 p-4 lg:p-8 pb-12 max-w-6xl mx-auto w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">
            Your Trips
          </h1>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {trips.length === 0 ? (
            <div className="th-soft-card p-8 text-center max-w-md mx-auto">
              <h2 className="th-title mb-2">No trips saved yet</h2>
              <p className="th-subtitle mb-6">
                Plan a trip and save it here to view and edit later!
              </p>
              <button
                type="button"
                onClick={() => navigate("/main")}
                className="inline-block py-3 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold border border-black dark:border-white hover:scale-[1.02] transition"
              >
                Plan Your Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  className="p-5 rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{trip.title}</h3>
                      <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                        {trip.startDate} - {trip.endDate}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold rounded-full px-3 py-1 border ${
                      trip.status === "saved"
                        ? "border-black/20 dark:border-white/30 bg-white dark:bg-black"
                        : trip.status === "upcoming"
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                        : "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                    }`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-semibold mb-5">
                    <span className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1">
                      {trip.tripDays} days
                    </span>
                    <span className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1">
                      {trip.adults} traveler{trip.adults > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewResults(trip)}
                      className="rounded-xl px-4 py-2 border border-black/20 dark:border-white/25 bg-white dark:bg-black text-sm font-semibold hover:scale-[1.01] transition"
                    >
                      View Results
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewItinerary(trip)}
                      className="rounded-xl px-4 py-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-sm font-bold"
                    >
                      View Itinerary
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTrip(trip._id)}
                      disabled={deletingTripId === trip._id}
                      className="rounded-xl px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition disabled:opacity-60"
                    >
                      {deletingTripId === trip._id ? (
                        "Deleting..."
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </GradientBackground>
  );
};

export default TripsPage;
