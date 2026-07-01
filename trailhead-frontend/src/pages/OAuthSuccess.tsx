import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");
    const email = params.get("email");
    const id = params.get("id");

    if (!token || !username || !email || !id) {
      navigate("/", { replace: true });
      return;
    }

    loginWithToken(token, { id, username, email });
    navigate("/main", { replace: true });
  }, [navigate, loginWithToken]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-black dark:text-white">
      <h2 className="text-2xl font-semibold mb-4">Signing you in...</h2>
      <p className="text-black/70 dark:text-white/70">Please wait, redirecting...</p>
    </div>
  );
};

export default OAuthSuccess;
