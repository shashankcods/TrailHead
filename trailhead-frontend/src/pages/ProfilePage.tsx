import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import TravelPreferences from "@/components/profile/TravelPreferences";
import ProfileDangerZone from "@/components/profile/ProfileDangerZone";
import GradientBackground from "@/components/GradientBackground";
import { getTrips } from "@/api/trips";

const getTripStartDate = (trip: any): Date | null => {
  let startStr = null;
  if (trip.startDate) {
    startStr = trip.startDate;
  } else if (trip.plannerData?.trip?.start_date) {
    startStr = trip.plannerData.trip.start_date;
  }
  if (!startStr) return null;
  const date = new Date(startStr);
  return isNaN(date.getTime()) ? null : date;
};

const getTripEndDate = (trip: any): Date | null => {
  let endStr = null;
  if (trip.endDate) {
    endStr = trip.endDate;
  } else if (trip.plannerData?.trip?.end_date) {
    endStr = trip.plannerData.trip.end_date;
  }
  if (!endStr) {
    const startDate = getTripStartDate(trip);
    let tripDays = null;
    if (trip.tripDays) {
      tripDays = trip.tripDays;
    } else if (trip.plannerData?.trip?.trip_days) {
      tripDays = trip.plannerData.trip.trip_days;
    }
    if (startDate && tripDays && typeof tripDays === 'number') {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (tripDays - 1));
      return endDate;
    }
    return null;
  }
  const date = new Date(endStr);
  return isNaN(date.getTime()) ? null : date;
};

const normalizeDateToStartOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const isCompletedTrip = (trip: any): boolean => {
  const endDate = getTripEndDate(trip);
  if (!endDate) return false;
  const today = normalizeDateToStartOfDay(new Date());
  const normalizedEndDate = normalizeDateToStartOfDay(endDate);
  return normalizedEndDate < today;
};

const isUpcomingTrip = (trip: any): boolean => {
  const endDate = getTripEndDate(trip);
  if (!endDate) return false;
  const today = normalizeDateToStartOfDay(new Date());
  const normalizedEndDate = normalizeDateToStartOfDay(endDate);
  return normalizedEndDate >= today;
};

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, accessToken } = useAuth();
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [savedTripsCount, setSavedTripsCount] = useState(0);
  const [upcomingTripsCount, setUpcomingTripsCount] = useState(0);
  const [completedTripsCount, setCompletedTripsCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isClient, isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const fetchTrips = async () => {
        try {
          const data = await getTrips(accessToken);
          const allTrips = data.trips;
          setSavedTripsCount(allTrips.length);
          setUpcomingTripsCount(allTrips.filter(isUpcomingTrip).length);
          setCompletedTripsCount(allTrips.filter(isCompletedTrip).length);
        } catch (err) {
          console.error(err);
        }
      };
      fetchTrips();
    }
  }, [isAuthenticated, accessToken]);

  if (!isClient || isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <GradientBackground>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight">
            Your Profile
          </h1>
        </div>

        <ProfileStats
          stats={{
            daysTraveled: 0,
            citiesVisited: 0,
            countries: 0,
            savedTrips: savedTripsCount,
            upcomingTrips: upcomingTripsCount,
            completedTrips: completedTripsCount,
          }}
        />

        <ProfileInfoForm
          initialName={user?.username || ""}
          email={user?.email || ""}
          initialBio=""
        />

        <TravelPreferences
          initialBudget="mid-range"
          initialStyle="cultural"
          initialInterests={["Food", "Museums"]}
        />

        <ProfileDangerZone />
      </main>
    </GradientBackground>
  );
};

export default ProfilePage;
