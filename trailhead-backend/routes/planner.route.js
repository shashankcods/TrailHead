import { Router }
from "express";

import {
  generatePlanner
}
from "../controllers/planner.controller.js";

const router =
  Router();

router.route("/").post(generatePlanner);

export default router;