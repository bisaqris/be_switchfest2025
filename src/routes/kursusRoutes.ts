import { Router } from "express";
import {
  getKursusList,
  getKursus,
  createKursus,
  updateKursus,
  deleteKursus,
  enrollKursus,
  getEnrolledKursusDetail,
} from "../controllers/kursusController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import uploadWithLogging from "../middlewares/uploadMiddleware.js";
import topicRoutes from './topicRoutes.js'; 

const router = Router();

router.get("/", getKursusList);
router.get("/:id", getKursus);


router.post("/:kursusId/enroll", checkAuth, enrollKursus);
router.get("/:kursusId/enrolled-detail", checkAuth, getEnrolledKursusDetail);
router.use('/:kursusId/topics', topicRoutes);

router.post("/", checkAuth, checkRole(["admin"]), uploadWithLogging('thumbnail'), createKursus);
router.patch("/:id", checkAuth, checkRole(["admin"]), uploadWithLogging('thumbnail'), updateKursus);
router.delete("/:id", checkAuth, checkRole(["admin"]), deleteKursus);

export default router;