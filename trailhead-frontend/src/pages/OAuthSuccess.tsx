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

      // Delay navigation slightly so React Router is ready
      setTimeout(() => {
        navigate("/main", { replace: true });
      }, 100);
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-black dark:text-white">
      <h2 className="text-2xl font-semibold mb-4">Signing you in...</h2>
      <p className="text-black/70 dark:text-white/70">Please wait, redirecting...</p>
    </div>
  );
};

export default OAuthSuccess;