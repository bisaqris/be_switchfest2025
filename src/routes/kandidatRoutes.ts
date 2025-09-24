import { Router } from "express";
import {
  applyForJob,
  getMyApplications,
  updateCandidateStatus,
  withdrawApplication,
} from "../controllers/kandidatController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import uploadWithLogging from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/", checkAuth, getMyApplications);
router.post(
  "/:jobId/apply",
  checkAuth,
  uploadWithLogging("resumeUrl"),
  applyForJob
);
router.patch(
  "/:id/status",
  checkAuth,
  checkRole(["hr", "admin"]),
  updateCandidateStatus
);
router.delete("/:id", checkAuth, withdrawApplication);

export default router;
