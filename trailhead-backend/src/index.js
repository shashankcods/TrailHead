import "./src/config/fixDNS.js"
import app from "./src/app.js";
import dotenv from "dotenv"
import connectDB from "../db/connect.js";

dotenv.config()

const PORT = process.env.PORT || 5000;

connectDB()
.then(() => {
    app.listen(PORT, () => console.log(`TrailHead backend running on port ${PORT}`))
})
.catch((err) => {
    console.log("MONGO DB connection failed!!!", err);
})
