import { Router } from "express";

import { getAttractions }
from "../controllers/attractions.controller.js";

const router = Router();

router.route("/").get(getAttractions);

export default router;