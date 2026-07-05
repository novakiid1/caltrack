import { Router } from 'express';
import { isLoggedIn, hasGoals } from '../middleware/auth.js';
import { getHome, postHome } from '../controllers/homeController.js';

const router = Router();

router.get("/", (req, res) => res.redirect("/home"));
router.get("/home", isLoggedIn, hasGoals, getHome);
router.post("/home", isLoggedIn, hasGoals, postHome);

export default router;
