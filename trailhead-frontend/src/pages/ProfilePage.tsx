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
          setSavedTripsCount(data.trips.filter(t => t.status === "saved").length);
          setUpcomingTripsCount(data.trips.filter(t => t.status === "upcoming").length);
          setCompletedTripsCount(data.trips.filter(t => t.status === "completed").length);
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
          initialNotifications={false}
        />

        <ProfileDangerZone />
      </main>
    </GradientBackground>
  );
};

export default ProfilePage;
