import passport from "../src/passport.js";
import {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  getProfileService,
  deleteUserService,
  googleLoginService,
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

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const data = await loginUserService(email, password);
    res.cookie("refreshToken", data.refreshToken, REFRESH_COOKIE_OPTIONS);
    const { refreshToken: _rt, ...responseData } = data;
    res.status(200).json(responseData);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const data = await logoutUserService(userId);
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    res.status(200).json(data);
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const data = await refreshAccessTokenService(refreshToken);
    res.cookie("refreshToken", data.refreshToken, REFRESH_COOKIE_OPTIONS);
    const { refreshToken: _rt, ...responseData } = data;
    res.status(200).json(responseData);
  } catch (error) {
    const status =
      error.message === "Refresh token is required" ? 400 : 401;
    res.status(status).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await getProfileService(userId);
    res.status(200).json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const googleAuth = (req, res, next) => {
  console.log("[Google OAuth] Initiating Google auth redirect");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    await deleteUserService(userId);
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const googleCallback = (req, res, next) => {
  console.log("[Google OAuth] Callback hit — query:", req.query);
  const base = process.env.FRONTEND_URL || "http://localhost:5173";

  passport.authenticate("google", { session: false }, async (err, profileData) => {
    if (err) {
      console.error("[Google OAuth] Passport error:", err?.message ?? err);
      return res.redirect(`${base}/login?error=google_failed`);
    }
    if (!profileData) {
      console.error("[Google OAuth] No profile data returned from strategy");
      return res.redirect(`${base}/login?error=google_failed`);
    }

    try {
      const { accessToken, refreshToken, user } = await googleLoginService(profileData);
      console.log("[Google OAuth] Success — user:", user.email);
      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
      const redirectUrl = `${base}/oauth-success?token=${accessToken}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}&id=${user.id}`;
      return res.redirect(redirectUrl);
    } catch (serviceErr) {
      console.error("[Google OAuth] Service error:", serviceErr?.message ?? serviceErr);
      return res.redirect(`${base}/login?error=google_failed`);
    }
  })(req, res, next);
};
