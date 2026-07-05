import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.js';
import { getJobs, runMissedMealJob } from '../controllers/adminController.js';

const router = Router();

router.get("/jobs", requireAdmin, getJobs);
router.post("/jobs/missed-meal/run", requireAdmin, runMissedMealJob);

export default router;
