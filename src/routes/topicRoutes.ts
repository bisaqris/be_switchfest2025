import { Router } from "express";
import {
  createTopic,
  deleteTopic,
  getTopic,
  getTopicsForKursus,
  updateTopic,
} from "../controllers/topicController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { createQuiz } from "../controllers/quizController.js";

const router = Router({ mergeParams: true });

router.get("/", checkAuth, getTopicsForKursus);

router.post("/", checkAuth, checkRole(["admin"]), createTopic);

router.get("/:id", checkAuth, getTopic);
router.patch("/:id", checkAuth, checkRole(["admin"]), updateTopic);
router.delete("/:id", checkAuth, checkRole(["admin"]), deleteTopic);

router.post('/:topicId/quiz', checkAuth, checkRole(['admin']), createQuiz);

export default router;
