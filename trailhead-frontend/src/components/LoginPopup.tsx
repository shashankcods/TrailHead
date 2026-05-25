import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleGuest = () => {
    onClose();
    navigate("/main");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white dark:bg-black border border-black/30 dark:border-white/30 p-5 rounded-lg shadow-lg w-96 text-black dark:text-white"
      >
        <h2 className="text-xl font-bold mb-4 text-center font-family-ubuntu">
          TrailHead
        </h2>

        <AuthForm
          onSuccess={() => {
            onClose();
            navigate("/main");
          }}
        />

        <button
          onClick={handleGuest}
          className="mt-4 w-full py-2 border rounded-lg bg-black text-white hover:bg-gray-800 transition-colors duration-500"
        >
          Continue as a guest
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
