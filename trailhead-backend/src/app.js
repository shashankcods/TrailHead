import express from "express";
// import cors from "cors";
import mapsRoute from "./agents/maps/maps.route.js";
<<<<<<< HEAD
import orchestratorRoute from "./orchestrator/orchestrator.route.js";
=======
import weatherRoute from "./agents/weather/weather.route.js";

>>>>>>> 812bee36bc487f7b981aa2c5c67089ee78cc2b0d
const app = express();

// app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("TrailHead is live");
});

app.use("/api/maps", mapsRoute);
<<<<<<< HEAD
app.use("/api/orchestrator", orchestratorRoute);
=======
app.use("/api/weather", weatherRoute);
>>>>>>> 812bee36bc487f7b981aa2c5c67089ee78cc2b0d

export default app;