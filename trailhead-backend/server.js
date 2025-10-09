// Entry point for the Trailhead backend
import "./src/config/fixDNS.js"
import "./src/config/env.js"; // Load env variables
import app from "./src/app.js"; // Import the express app from app.js
import { connectDB } from "./src/db/connect.js"; // Handle connections to MongoDB atlas

// USE PORT defined in .env or else fallback to 5000
const PORT = process.env.PORT || 5000;

// Establishes database connection first and then starts the server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`TrailHead backend running on port ${PORT}`))
});
