import { Router } from 'express';
import { isLoggedIn, hasGoals } from '../middleware/auth.js';
import { getSettings, postSettings } from '../controllers/settingsController.js';

const router = Router();

router.get("/settings", isLoggedIn, hasGoals, getSettings);
router.post("/settings", isLoggedIn, hasGoals, postSettings);

export default router;
