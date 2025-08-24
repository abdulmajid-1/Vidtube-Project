import { Router } from "express";
import { healthcheck } from "../controllers/healthCheck.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/").get(healthcheck);
router.route("/test").get(healthcheck);

export default router;
