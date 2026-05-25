import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import googleLogo from "../assets/google-black.svg";

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const passwordRules = [
    { regex: /.{8,}/, message: "Atleast 8 characters" },
    { regex: /[A-Z]/, message: "Atleast 1 uppercase letter" },
    { regex: /[a-z]/, message: "Atleast 1 lowercase letter" },
    { regex: /[0-9]/, message: "Atleast 1 number" },
    { regex: /[^A-Za-z0-9]/, message: "Atleast 1 special character" },
  ];

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

    setLoading(true);
    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError("");
    setGoogleLoading(true);

    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const googleAuthUrl =
      import.meta.env.VITE_GOOGLE_AUTH_URL || `${apiBase}/api/auth/google`;

    window.location.href = googleAuthUrl;
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {mode === "signup" && (
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-2 border border-black/30 dark:border-white/30 rounded-lg bg-white dark:bg-black text-black dark:text-white"
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-2 border border-black/30 dark:border-white/30 rounded-lg bg-white dark:bg-black text-black dark:text-white"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-2 border border-black/30 dark:border-white/30 rounded-lg bg-white dark:bg-black text-black dark:text-white"
      />
      {mode === "signup" && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="p-2 border border-black/30 dark:border-white/30 rounded-lg bg-white dark:bg-black text-black dark:text-white"
        />
      )}

      {mode === "signup" && (
        <ul className="text-sm text-black/70 dark:text-white/70 mt-1">
          {passwordRules.map((rule, idx) => (
            <li
              key={idx}
              className={
                rule.regex.test(password)
                  ? "text-black dark:text-white font-semibold"
                  : "text-black/70 dark:text-white/70"
              }
            >
              {rule.message}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="text-black dark:text-white font-semibold">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg shadow-lg hover:scale-105 transition duration-300 ease-in-out border border-black dark:border-white disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading
          ? "Please wait..."
          : mode === "signin"
            ? "Sign In"
            : "Sign Up"}
      </button>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full py-3 px-6 bg-white dark:bg-black text-black dark:text-white font-semibold rounded-lg shadow border border-black dark:border-white hover:opacity-90 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <img src={googleLogo} alt="Google" className="w-5 h-5" />
        {googleLoading ? "Redirecting..." : "Sign in with Google"}
      </button>

      <p className="text-center text-sm -mt-2">
        {mode === "signin"
          ? "Don't have an account? "
          : "Already have an account? "}
        <span
          className="text-black dark:text-white cursor-pointer underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
          }}
        >
          {mode === "signin" ? "Sign Up" : "Sign In"}
        </span>
      </p>
    </form>
  );
};

export default AuthForm;
