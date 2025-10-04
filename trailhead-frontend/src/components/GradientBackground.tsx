import React, { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const GradientBackground: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#3A1C71] to-[#D76D77]">
      {children}
    </div>
  );
};

export default GradientBackground;
