import { Router } from "express";
import {
  deleteQuiz,
  getQuizForUser,
  submitQuiz,
} from "../controllers/quizController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { createQuestion } from "../controllers/questionController.js";

const router = Router();

router.get("/:id/take", checkAuth, getQuizForUser);
router.post("/:id/submit", checkAuth, submitQuiz);

router.delete("/:id", checkAuth, checkRole(["admin"]), deleteQuiz);

router.post('/:quizId/questions', checkAuth, checkRole(['admin']), createQuestion);

export default router;
