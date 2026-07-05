import { Router } from 'express';
import { isLoggedIn, hasGoals } from '../middleware/auth.js';
import { getHistory } from '../controllers/historyController.js';

const router = Router();

router.get("/history", isLoggedIn, hasGoals, getHistory);

export default router;
