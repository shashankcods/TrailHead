import React, { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

// gradient background now changed to a plain bg for a better look
const GradientBackground: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      {children}
    </div>
  );
};

export default GradientBackground;
