// TODO(OAuth): Load via app.js when Google OAuth env vars are configured.
// src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { User } from "../models/auth.model.js";
console.log("✅ Passport config loaded");
console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CALLBACK_URL =", process.env.GOOGLE_CALLBACK_URL);


const JWT_SECRET = process.env.JWT_SECRET || "trailhead_secret_key";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const username = profile.displayName || email?.split("@")[0];
        const profilePic = profile.photos?.[0]?.value;

        // check if user already exists
        let user = await User.findOne({ googleId });

        if (!user) {
          // if a manual signup exists with same email, link it
          user = await User.findOne({ email });
          if (user) {
            user.googleId = googleId;
            user.profilePic = profilePic;
            await user.save();
          } else {
            user = await User.create({
              username,
              email,
              password: "google_oauth",
              googleId,
              profilePic,
            });
          }
        }

        // generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
          expiresIn: "7d",
        });

        const result = {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
          },
        };

        return done(null, result);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;