import express from "express";
import cors from "cors";
import testRoute from "./routes/testRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("TrailHead is live");
});

app.use("/api/test", testRoute);

export default app;