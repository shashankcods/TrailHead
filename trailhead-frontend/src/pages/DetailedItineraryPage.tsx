import React, { useCallback, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Currency } from "@/components/Navbar";
import Navbar from "@/components/Navbar";
import GradientBackground from "@/components/GradientBackground";
import DetailedItinerary from "@/components/results/DetailedItinerary";
import PlannerExtras from "@/components/results/PlannerExtras";
import TripChatDrawer from "@/components/chat/TripChatDrawer";
import { applyItineraryAction, isMutatingAction } from "@/components/chat/itineraryActions";
import type { ItineraryAction } from "@/types/chat";
import type { PlannerData } from "@/types/planner";
import { useAuth } from "@/context/AuthContext";
import { createTrip } from "@/api/trips";

interface DetailedItineraryPageProps {
  selectedCurrency: Currency;
}

interface ItineraryLocationState {
  plannerData?: PlannerData;
}

const DetailedItineraryPage: React.FC<DetailedItineraryPageProps> = ({
  selectedCurrency,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuth();
  const initialPlannerData = (location.state as ItineraryLocationState | null)
    ?.plannerData;

  const [plannerData, setPlannerData] = useState<PlannerData | undefined>(
    initialPlannerData
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const undoSnapshotRef = useRef<PlannerData | null>(null);

  const handleApplyItineraryAction = useCallback((action: ItineraryAction) => {
    if (!isMutatingAction(action)) return;

    setPlannerData((prev) => {
      if (!prev) return prev;
      undoSnapshotRef.current = prev;
      setCanUndo(true);
      setIsSaved(false);
      setSavedTripId(null);
      return applyItineraryAction(prev, action);
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (!undoSnapshotRef.current) return;
    setPlannerData(undoSnapshotRef.current);
    undoSnapshotRef.current = null;
    setCanUndo(false);
    setIsSaved(false);
    setSavedTripId(null);
  }, []);

  const handleSaveTrip = useCallback(async () => {
    console.log("[SaveTrip] Button clicked");
    
    if (!isAuthenticated) {
      console.log("[SaveTrip] Not authenticated");
      return;
    }

    if (!accessToken) {
      console.log("[SaveTrip] No access token");
      return;
    }

    if (!plannerData) {
      console.log("[SaveTrip] No planner data");
      return;
    }

    if (isSaved && savedTripId) {
      console.log("[SaveTrip] Already saved, skipping");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const trip = plannerData.trip ?? {};
    const normalizedDays = (() => {
      if (!plannerData.itinerary) return [];
      if (Array.isArray(plannerData.itinerary)) return plannerData.itinerary;
      return plannerData.itinerary.days || [];
    })();

    const tripData = {
      title: `${trip.source || "Trip"} → ${trip.destination || "Destination"}`,
      source: trip.source || "",
      destination: trip.destination || "",
      startDate: trip.start_date || "",
      endDate: trip.end_date || "",
      tripDays: trip.trip_days || normalizedDays.length || 1,
      adults: trip.adults || 1,
      status: "saved",
      plannerData: plannerData,
    };

    console.log("[SaveTrip] Request payload:", tripData);

    try {
      const response = await createTrip(accessToken, tripData);
      console.log("[SaveTrip] Response:", response);
      setSavedTripId(response.trip._id);
      setIsSaved(true);
    } catch (error) {
      console.error("[SaveTrip] Error:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save trip");
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, accessToken, plannerData, isSaved, savedTripId]);

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-black dark:text-white">
        <Navbar showCurrencyToggle={false} />
        {plannerData ? (
          <main className="flex-1 p-4 lg:p-8 pb-12 max-w-6xl mx-auto w-full">
            <div className="th-card p-6 md:p-8 space-y-10">
              <DetailedItinerary
                plannerData={plannerData}
                onBack={() => navigate("/results", { state: { plannerData } })}
                onOpenChat={() => setIsChatOpen(true)}
                onSaveTrip={handleSaveTrip}
                isSaving={isSaving}
                isSaved={isSaved}
                saveError={saveError}
                isAuthenticated={isAuthenticated}
              />
              <PlannerExtras
                plannerData={plannerData}
                selectedCurrency={selectedCurrency}
              />
            </div>
          </main>
        ) : (
          <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="th-soft-card p-8 text-center max-w-md">
              <h2 className="th-title mb-2">Detailed itinerary unavailable</h2>
              <p className="th-subtitle mb-6">
                Open an itinerary from results first, or plan a trip to generate
                one.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/results")}
                  className="inline-block py-3 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold border border-black dark:border-white hover:scale-[1.02] transition"
                >
                  Back to Results
                </button>
                <Link
                  to="/main"
                  className="inline-block py-3 px-6 rounded-xl border border-black/25 dark:border-white/30 bg-white dark:bg-black text-black dark:text-white font-bold"
                >
                  Plan Your Trip
                </Link>
              </div>
            </div>
          </main>
        )}

        <TripChatDrawer
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          plannerData={plannerData ?? null}
          onApplyItineraryAction={handleApplyItineraryAction}
          canUndo={canUndo}
          onUndo={handleUndo}
        />
      </div>
    </GradientBackground>
  );
};

export default DetailedItineraryPage;
