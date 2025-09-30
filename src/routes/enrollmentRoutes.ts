import { Router } from "express";
import {
  createEnrollment,
  getMyEnrollments,
  getEnrollmentsForKursus,
  deleteEnrollment,
} from "../controllers/enrollmentController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = Router();

router.post("/kursus/:kursusId/enroll", checkAuth, createEnrollment);
router.get("/enrollments/me", checkAuth, getMyEnrollments);

router.get(
  "/kursus/:kursusId/enrollments",
  checkAuth,
  checkRole(["admin"]),
  getEnrollmentsForKursus
);
router.delete(
  "/enrollments/:id",
  checkAuth,
  checkRole(["admin"]),
  deleteEnrollment
);

export default router;
