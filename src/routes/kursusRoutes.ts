import { Router } from "express";
import {
  getKursuses,
  getKursus,
  createKursus,
  updateKursus,
  deleteKursus,
} from "../controllers/kursusController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = Router();

router.get("/", getKursuses);
router.get("/:id", getKursus);
router.post("/", checkAuth, checkRole(["admin", "hr"]), createKursus);
router.patch("/:id", checkAuth, checkRole(["admin", "hr"]), updateKursus);
router.delete("/:id", checkAuth, checkRole(["admin", "hr"]), deleteKursus);

export default router;
