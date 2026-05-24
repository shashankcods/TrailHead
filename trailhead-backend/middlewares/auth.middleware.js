import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "trailhead_secret_key";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id,
      email: decoded.email,
    };
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired access token" });
  }
};
