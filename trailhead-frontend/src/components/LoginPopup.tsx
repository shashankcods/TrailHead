import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthForm from "./AuthForm"; 

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();   
  const navigate = useNavigate();     
  const popupRef = useRef<HTMLDivElement>(null);

  // clicking outside popup stays on landing page
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

  // Handle cancel button - navigate to main page without signing in
  const handleGuest = () => {
    onClose(); // close popup
    navigate("/main"); // navigate to main page without auth
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-white p-5 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center font-family-ubuntu">TrailHead</h2>

        <AuthForm
          onSuccess={() => {
            login();            // mark user as logged in
            onClose();          // close popup
            navigate("/main");  // go to main page
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






