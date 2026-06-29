import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export type Currency = {
  code: string;
  symbol: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  defaultBudget: number;
};

export const currencies: Currency[] = [
  { code: "INR", symbol: "₹", sliderMin: 25000, sliderMax: 500000, sliderStep: 5000, defaultBudget: 100000 },
  { code: "USD", symbol: "$", sliderMin: 500, sliderMax: 10000, sliderStep: 100, defaultBudget: 1000 },
  { code: "EUR", symbol: "€", sliderMin: 500, sliderMax: 10000, sliderStep: 100, defaultBudget: 1000 },
  { code: "AED", symbol: "د.إ", sliderMin: 2000, sliderMax: 40000, sliderStep: 500, defaultBudget: 5000 },
  { code: "KWD", symbol: "د.ك", sliderMin: 150, sliderMax: 3000, sliderStep: 50, defaultBudget: 300 },
];

interface NavbarProps {
  showCurrencyToggle?: boolean;
  selectedCurrency?: Currency;
  setSelectedCurrency?: React.Dispatch<React.SetStateAction<Currency>>;
  showPlanAndResultsButtons?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showPlanAndResultsButtons = true }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const shouldUseDark =
      storedTheme !== null
        ? storedTheme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setIsDropdownOpen(false);
    try {
      await logout();
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/20">
      <Link to="/">
        <h1 className="text-black dark:text-white text-[1.7rem] font-extrabold tracking-tight font-family-ubuntu cursor-pointer">
          TrailHead
        </h1>
      </Link>

      <div className="flex items-center gap-3">
        {showPlanAndResultsButtons && (
          <div className="hidden md:flex items-center gap-2 mr-2">
            <NavLink
              to="/main"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg border text-[0.92rem] font-semibold tracking-tight transition-colors ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "bg-white dark:bg-black text-black dark:text-white border-black/25 dark:border-white/30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                }`
              }
            >
              Plan New Trip
            </NavLink>
          </div>
        )}

        {isAuthenticated && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/25 dark:border-white/30 bg-white dark:bg-black hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-sm font-bold">
                {user?.username ? getInitials(user.username) : "?"}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-black/10 dark:border-white/20">
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {user?.username || "Account"}
                  </p>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    {user?.email || ""}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/trips");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    Manage Trips
                  </button>
                  <div className="border-t border-black/10 dark:border-white/20 my-1" />
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-60"
                  >
                    {loggingOut ? "Logging out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-lg border border-black/25 dark:border-white/30 bg-white dark:bg-black text-[0.92rem] font-semibold tracking-tight text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200"
        >
          {isDarkMode ? "Light" : "Dark"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
