import React from "react";
import { NavLink } from "react-router-dom";

const baseClass =
  "px-4 py-3 rounded-lg font-semibold border border-transparent transition-colors";

const PlannerSidebar: React.FC = () => {
  return (
    <aside className="hidden md:block w-64 border-r border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/5 p-4">
      <nav className="space-y-2">
        <NavLink
          to="/main"
          className={({ isActive }) =>
            isActive
              ? `${baseClass} bg-black text-white dark:bg-white dark:text-black`
              : `${baseClass} hover:bg-black/10 dark:hover:bg-white/10`
          }
        >
          Plan Your Trip
        </NavLink>
        <NavLink
          to="/results"
          className={({ isActive }) =>
            isActive
              ? `${baseClass} bg-black text-white dark:bg-white dark:text-black`
              : `${baseClass} hover:bg-black/10 dark:hover:bg-white/10`
          }
        >
          Results
        </NavLink>
      </nav>
    </aside>
  );
};

export default PlannerSidebar;

