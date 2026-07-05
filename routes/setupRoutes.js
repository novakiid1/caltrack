import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.js';
import { getSetup, postSetup } from '../controllers/setupController.js';

const router = Router();

router.get("/setup", isLoggedIn, getSetup);
router.post("/setup", isLoggedIn, postSetup);

export default router;
