import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "trailhead_secret_key";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    // Get the Authorization header
    const authHeader = req.headers["authorization"];

    // Check if it exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Extract the token part
    const token = authHeader.split(" ")[1];

    // Verify the token using our secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the decoded user data to the request
    req.user = decoded;

    // Move to the next middleware / controller
    next();

  } catch (error) {
    // Token is invalid or expired
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
