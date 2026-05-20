import "dotenv/config"
import "./fixDNS.js"
import app from "./app.js"
import connectDB from "../db/connect.js";

const PORT = process.env.PORT || 5000;

connectDB()
.then(() => {
    app.listen(PORT, () => console.log(`TrailHead backend running on port ${PORT}`))
})
.catch((err) => {
    console.log("MONGO DB connection failed!!!", err);
})
