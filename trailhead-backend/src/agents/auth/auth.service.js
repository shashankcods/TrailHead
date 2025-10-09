import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dns from "dns";
import { User } from "./auth.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "trailhead_secret_key";

// Password checklist validator
const validatePassword = (password) => {
  const checklist = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[\W_]/.test(password),
    noSpaces: !/\s/.test(password),
  };

  const messages = {
    minLength: "At least 8 characters long",
    hasUppercase: "Contains an uppercase letter (A–Z)",
    hasLowercase: "Contains a lowercase letter (a–z)",
    hasNumber: "Contains a number (0–9)",
    hasSpecialChar: "Contains a special character (!@#$ etc.)",
    noSpaces: "No spaces allowed",
  };

  // Build arrays of passed/failed
  const failed = Object.entries(checklist)
    .filter(([_, passed]) => !passed)
    .map(([rule]) => messages[rule]);

  if (failed.length > 0) {
    // Return structured error for frontend checklist
    const details = Object.entries(checklist).map(([rule, passed]) => ({
      rule: messages[rule],
      passed,
    }));
    const error = new Error("Password validation failed");
    error.type = "password_validation";
    error.details = details;
    throw error;
  }

  return true;
};

// Register service
// Register service
export const registerUserService = async (username, email, password) => {
  try {
    // Check duplicate manually (email)
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists with this email");

    // Validate email domain via MX record
    const domain = email.split("@")[1];
    if (!domain) throw new Error("Invalid email address format");

    await new Promise((resolve, reject) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err || !addresses || addresses.length === 0)
          reject("Invalid domain");
        else resolve(addresses);
      });
    });

    // Validate password strength
    validatePassword(password);

    // Hash and save
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };
  } catch (error) {
    // Re-throw the original MongoDB error so controller can read error.code & error.keyPattern
    throw error;
  }
};

// Login service
export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    message: "Login successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};
