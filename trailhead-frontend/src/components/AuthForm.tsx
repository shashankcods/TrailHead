import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  /// defining rules to set password
  const passwordRules = [
    { regex: /.{8,}/, message: "Atleast 8 characters" },
    { regex: /[A-Z]/, message: "Atleast 1 uppercase letter" },
    { regex: /[a-z]/, message: "Atleast 1 lowercase letter" },
    { regex: /[0-9]/, message: "Atleast 1 number" },
    { regex: /[^A-Za-z0-9]/, message: "Atleast 1 special character" },
  ];

  /*const handleSubmit = async (e: React.FormEvent) => { // to be used when endpoints are available for post req
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
      const endpoint = mode === "signin" ? "/api/login" : "/api/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login();
        onSuccess?.();
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };*/ 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
  
    try {
      // FAKE backend call
      await new Promise((resolve) => setTimeout(resolve, 500)); // simulate network delay
  
      // Simulate success response
      const resOk = true; // pretend the server responded with 200 OK
      const data = { message: "Success" };
  
      if (resOk) {
        login();       // mark user as authenticated
        onSuccess?.(); 
      } else {
        setError(data.message || "Something went wrong");
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
          value={name}
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

      {/* Password rules checklist */}
      {mode === "signup" && (
        <ul className="text-sm text-gray-400 mt-1">
          {passwordRules.map((rule, idx) => (
            <li
              key={idx}
              className={rule.regex.test(password) ? "text-green-500" : "text-gray-400"}
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
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Sign Up" : "Sign In"}
        </span>
      </p>
    </form>
  );
};

export default AuthForm;



