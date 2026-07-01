// TODO(OAuth): Load via app.js when Google OAuth env vars are configured.
// src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
console.log("✅ Passport config loaded");
console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CALLBACK_URL =", process.env.GOOGLE_CALLBACK_URL);


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("[Google OAuth] Strategy verify — profile id:", profile.id, "email:", profile.emails?.[0]?.value);
      done(null, {
        googleId: profile.id,
        email: profile.emails?.[0]?.value,
        username: profile.displayName || profile.emails?.[0]?.value?.split("@")[0],
        profilePic: profile.photos?.[0]?.value,
      });
    }
  )
);

export default passport;