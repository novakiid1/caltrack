import { Router } from 'express';
import { isLoggedIn, hasGoals } from '../middleware/auth.js';
import { getMeal, deleteMeal, deleteMealItem, updateMeal } from '../controllers/mealController.js';

const router = Router();

router.get("/:mealId", isLoggedIn, hasGoals, getMeal);
router.post("/:mealId/delete", isLoggedIn, hasGoals, deleteMeal);
router.post("/:mealId/item/:foodId/delete", isLoggedIn, hasGoals, deleteMealItem);
router.post("/:mealId", isLoggedIn, hasGoals, updateMeal);

export default router;
