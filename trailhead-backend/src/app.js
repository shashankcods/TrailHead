import express from "express";
// import cors from "cors";
import mapsRoute from "./agents/maps/maps.route.js";

const app = express();

// app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("TrailHead is live");
});

app.use("/api/maps", mapsRoute);

export default app;