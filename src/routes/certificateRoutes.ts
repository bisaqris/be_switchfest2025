import { Router } from "express";
import {
  getMyCertificates,
  getCertificateDetails,
} from "../controllers/certificateController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", checkAuth, getMyCertificates);

router.get("/:id", getCertificateDetails);

export default router;
