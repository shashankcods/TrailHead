import jwt from "jsonwebtoken";
import dns from "dns";
import { User } from "../models/auth.model.js";

const REFRESH_SECRET = process.env.REFRESH_SECRET;

const issueAuthTokens = (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  return { accessToken, refreshToken };
};

const issueAndPersistAuthTokens = async (user) => {
  const tokens = issueAuthTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });
  return tokens;
};

const validateUsername = (username) => {
  const trimmed = username?.trim();
  if (!trimmed || trimmed.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }
  if (/\s/.test(trimmed)) {
    throw new Error("Username cannot contain spaces");
  }
  return trimmed;
};

const validateEmail = (email) => {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
    throw new Error("Invalid email address");
  }
  return trimmed;
};

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

  const failed = Object.entries(checklist)
    .filter(([_, passed]) => !passed)
    .map(([rule]) => messages[rule]);

  if (failed.length > 0) {
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

const toPublicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
});

export const registerUserService = async (username, email, password) => {
  const validUsername = validateUsername(username);
  const validEmail = validateEmail(email);

  const existingUser = await User.findOne({
    $or: [{ email: validEmail }, { username: validUsername.toLowerCase() }],
  });
  if (existingUser) {
    if (existingUser.email === validEmail) {
      throw new Error("User already exists with this email");
    }
    throw new Error("Username already in use");
  }

  const domain = validEmail.split("@")[1];
  await new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses?.length) {
        reject(new Error("Invalid email domain"));
      } else {
        resolve(addresses);
      }
    });
  });

  validatePassword(password);

  const newUser = await User.create({
    username: validUsername,
    email: validEmail,
    password,
  });

  return toPublicUser(newUser);
};

export const loginUserService = async (email, password) => {
  const validEmail = validateEmail(email);
  const user = await User.findOne({ email: validEmail });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new Error("Invalid email or password");

  const { accessToken, refreshToken } = await issueAndPersistAuthTokens(user);

  return {
    message: "Login successful",
    accessToken,
    refreshToken,
    token: accessToken,
    user: toPublicUser(user),
  };
};

export const logoutUserService = async (userId) => {
  const user = await User.findById(userId).select("+refreshToken");
  if (!user) throw new Error("User not found");

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  return { message: "Logout successful" };
};

export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }
  if (!REFRESH_SECRET) {
    throw new Error("REFRESH_SECRET is not configured");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const userId = decoded.id || decoded._id;
  const user = await User.findById(userId).select("+refreshToken");
  if (!user) throw new Error("User not found");

  if (!user.refreshToken || user.refreshToken !== refreshToken) {
    throw new Error("Invalid or expired refresh token");
  }

  const tokens = await issueAndPersistAuthTokens(user);
  return {
    message: "Token refreshed successfully",
    ...tokens,
    token: tokens.accessToken,
  };
};

export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return toPublicUser(user);
};
