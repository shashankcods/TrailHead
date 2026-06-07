import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TravelPreferencesProps {
  initialBudget: "budget" | "mid-range" | "luxury";
  initialStyle: "adventure" | "relaxation" | "cultural" | "business";
  initialInterests: string[];
  initialNotifications: boolean;
}

const INTERESTS = [
  "Museums",
  "Nightlife",
  "Nature",
  "Food",
  "Shopping",
  "History",
  "Art",
];

const TravelPreferences: React.FC<TravelPreferencesProps> = ({
  initialBudget,
  initialStyle,
  initialInterests,
  initialNotifications,
}) => {
  const [budget, setBudget] = useState(initialBudget);
  const [style, setStyle] = useState(initialStyle);
  const [interests, setInterests] = useState(initialInterests);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <div className="space-y-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Travel Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Preference */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Budget Preference
            </label>
            <div className="flex flex-wrap gap-2">
              {["budget", "mid-range", "luxury"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setBudget(opt as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    budget === opt
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Travel Style
            </label>
            <div className="flex flex-wrap gap-2">
              {["adventure", "relaxation", "cultural", "business"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStyle(opt as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    style === opt
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    interests.includes(interest)
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-white dark:bg-black text-black dark:text-white border-black/20 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black dark:text-white">
                Enable Notifications
              </p>
              <p className="text-xs text-black/60 dark:text-white/60">
                Get updates about your trips
              </p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? "bg-black dark:bg-white" : "bg-black/20 dark:bg-white/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black dark:text-white">
                Dark Mode
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? "bg-black dark:bg-white" : "bg-black/20 dark:bg-white/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelPreferences;
