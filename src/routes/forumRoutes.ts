import { Router } from "express";
import {
  getAllThreads,
  getThreadDetails,
  createThread,
  createPost,
} from "../controllers/forumController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(checkAuth);
router.get("/", getAllThreads);
router.post("/", createThread);
router.get("/:threadId", getThreadDetails);
router.post("/:threadId/reply", createPost);

export default router;
