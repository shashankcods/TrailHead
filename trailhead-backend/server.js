import "./src/config/env.js";
// console.log("✅ ENV file loaded:", process.cwd());
// console.log("✅ ORS_API_KEY =", process.env.ORS_API_KEY);
import app from "./src/app.js";
import { connectDB } from "./src/db/connect.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`TrailHead backend running on port ${PORT}`))
});
