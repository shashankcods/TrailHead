import express from "express";
// import cors from "cors";
import mapsRoute from "./agents/maps/maps.route.js";
import orchestratorRoute from "./orchestrator/orchestrator.route.js";
import weatherRoute from "./agents/weather/weather.route.js";

const app = express();

// app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("TrailHead is live");
});

app.use("/api/maps", mapsRoute);
app.use("/api/orchestrator", orchestratorRoute);
app.use("/api/weather", weatherRoute);

export default app;