import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordRules = [
    { regex: /.{8,}/, message: "At least 8 characters" },
    { regex: /[A-Z]/, message: "At least 1 uppercase letter" },
    { regex: /[a-z]/, message: "At least 1 lowercase letter" },
    { regex: /[0-9]/, message: "At least 1 number" },
    { regex: /[^A-Za-z0-9]/, message: "At least 1 special character" },
  ];

  // ✅ Handle Google OAuth redirect token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");

    if (token) {
      localStorage.setItem("token", token);
      if (username) localStorage.setItem("username", username);
      login();
      navigate("/main"); // redirect to your main/dashboard page
    }
  }, [login, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      for (const rule of passwordRules) {
        if (!rule.regex.test(password)) {
          setError(`Password must have ${rule.message.toLowerCase()}`);
          return;
        }
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      const endpoint =
        mode === "signin" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login();
        onSuccess?.();
      } else {
        setError(data.message || "Something went wrong");
        console.log(data);
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {mode === "signup" && (
        <input
          type="text"
          placeholder="Full Name"
          value={username}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-2 border border-gray-500 rounded-lg"
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-2 border border-gray-500 rounded-lg"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-2 border border-gray-500 rounded-lg"
      />

      {mode === "signup" && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="p-2 border border-gray-500 rounded-lg"
        />
      )}

      {mode === "signup" && (
        <ul className="text-sm text-gray-400 mt-1">
          {passwordRules.map((rule, idx) => (
            <li
              key={idx}
              className={
                rule.regex.test(password)
                  ? "text-green-500"
                  : "text-gray-400"
              }
            >
              {rule.message}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        className="w-full py-3 px-6 bg-purple-950 text-white font-bold rounded-lg shadow-lg hover:bg-purple-800 hover:scale-105 transition duration-300 ease-in-out"
      >
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </button>

      <p className="text-center text-sm -mt-2">
        {mode === "signin"
          ? "Don't have an account? "
          : "Already have an account? "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() =>
            setMode(mode === "signin" ? "signup" : "signin")
          }
        >
          {mode === "signin" ? "Sign Up" : "Sign In"}
        </span>
      </p>

      <div className="relative flex items-center justify-center my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative bg-white px-3 text-gray-500 text-sm">or</div>
      </div>

      <button
        type="button"
        onClick={() => (window.location.href = "/api/auth/google")}
        className="w-full py-3 px-6 border border-gray-400 bg-white text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-100 hover:scale-105 transition duration-300 ease-in-out flex items-center justify-center gap-2"
      >
        <img
          src="../src/assets/google-black.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Sign in with Google
      </button>
    </form>
  );
};

export default AuthForm;





