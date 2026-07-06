import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.js';
import { getJobs, runMissedMealJob } from '../controllers/adminController.js';
import { listFoods, editFoodForm, updateFood } from '../controllers/adminFoodController.js';

const router = Router();

router.get("/jobs", requireAdmin, getJobs);
router.post("/jobs/missed-meal/run", requireAdmin, runMissedMealJob);

router.get("/foods", requireAdmin, listFoods);
router.get("/foods/:id/edit", requireAdmin, editFoodForm);
router.post("/foods/:id", requireAdmin, updateFood);

export default router;
