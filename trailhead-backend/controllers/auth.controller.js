import {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  getProfileService,
} from "../services/auth.service.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await registerUserService(username, email, password);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.type === "password_validation") {
      return res.status(400).json({
        message: "Password does not meet the requirements",
        checklist: error.details,
      });
    }

    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`,
      });
    }

    res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const data = await loginUserService(email, password);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const data = await logoutUserService(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    const data = await refreshAccessTokenService(refreshToken);
    res.status(200).json(data);
  } catch (error) {
    const status =
      error.message === "Refresh token is required" ? 400 : 401;
    res.status(status).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getProfileService(req.user.id);
    res.status(200).json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

// TODO(OAuth): Re-enable when Google OAuth is configured (passport + env vars)
// import passport from "../src/passport.js";
// export const googleAuth = ...
// export const googleCallback = ...
