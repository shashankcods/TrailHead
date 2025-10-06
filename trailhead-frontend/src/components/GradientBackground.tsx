import React, { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const GradientBackground: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0c29]">
      {children}
    </div>
  );
};

export default GradientBackground;
