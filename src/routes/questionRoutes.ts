import { Router } from 'express';
import {
  deleteQuestion,
  updateQuestion
} from '../controllers/questionController.js';
import { checkAuth } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/checkRole.js';

const router = Router();

router.use(checkAuth, checkRole(['admin']));
router.patch('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;