import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");

    if (token) {
      localStorage.setItem("jwt", token);
      localStorage.setItem("username", username || "");
      navigate("/dashboard"); // redirect to main app after login
    } else {
      navigate("/login"); // fallback if token missing
    }
  }, [navigate]);

  return <div>Signing you in...</div>;
};

export default OAuthSuccess;