import { Router } from "express";
import {
  getMyApplications,
  updateCandidateStatus,
  withdrawApplication,
} from "../controllers/kandidatController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = Router();

router.get("/", checkAuth, getMyApplications);
router.patch(
  "/:id/status",
  checkAuth,
  checkRole(["hr", "admin"]),
  updateCandidateStatus
);
router.delete("/:id", checkAuth, withdrawApplication);

export default router;
