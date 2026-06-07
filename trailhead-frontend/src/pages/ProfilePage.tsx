import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import TravelPreferences from "@/components/profile/TravelPreferences";
import ProfileDangerZone from "@/components/profile/ProfileDangerZone";
import GradientBackground from "@/components/GradientBackground";

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isClient, isAuthenticated, isLoading, navigate]);

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
            savedTrips: 0,
            upcomingTrips: 0,
            completedTrips: 0,
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
