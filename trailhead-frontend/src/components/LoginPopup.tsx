import React from "react";
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

  if (!isOpen) return null;

  // parent component of authform
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center font-family-ubuntu">TrailHead</h2>

        <AuthForm
          onSuccess={() => {
            login();            // mark user as logged in
            onClose();          // close popup
            navigate("/main");  // go to main page
          }}
        />

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 border rounded-lg bg-black text-white hover:bg-gray-800 transition-colors duration-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;






