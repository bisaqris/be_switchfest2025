import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategory);

router.post("/", checkAuth, checkRole(["admin",'hr']), createCategory);
router.patch("/:id", checkAuth, checkRole(["admin",'hr']), updateCategory);
router.delete("/:id", checkAuth, checkRole(["admin",'hr']), deleteCategory);

export default router;
