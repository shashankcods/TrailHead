import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/5">
      <Link to="/">
        <h1 className="text-white text-4xl font-bold font-family-ubuntu cursor-pointer">
          TrailHead
        </h1>
      </Link>
    </nav>
  );
};

export default Navbar;
