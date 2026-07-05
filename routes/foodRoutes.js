import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.js';
import { searchFoods } from '../controllers/foodController.js';

const router = Router();

router.get('/api/foods', isLoggedIn, searchFoods);

export default router;
