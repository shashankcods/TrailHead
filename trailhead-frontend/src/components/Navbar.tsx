import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

export type Currency = {
  code: string;
  symbol: string;
};

// using chosen currencies for now to implement currency conversion feature
export const currencies: Currency[] = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "AED", symbol: "د.إ" },
  { code: "KWD", symbol: "د.ك" },
];

interface NavbarProps {
  showCurrencyToggle?: boolean;
}

const Navbar: React.FC<NavbarProps> = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const shouldUseDark =
      storedTheme !== null
        ? storedTheme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/20">
      <Link to="/">
        <h1 className="text-black dark:text-white text-[1.7rem] font-extrabold tracking-tight font-family-ubuntu cursor-pointer">
          TrailHead
        </h1>
      </Link>

      <div className="flex items-center gap-3">
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
            Plan Your Trip
          </NavLink>
          <NavLink
            to="/results"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg border text-[0.92rem] font-semibold tracking-tight transition-colors ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-white dark:bg-black text-black dark:text-white border-black/25 dark:border-white/30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              }`
            }
          >
            Results
          </NavLink>
        </div>

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



