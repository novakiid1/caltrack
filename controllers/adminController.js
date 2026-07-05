import { checkMissedMeals } from '../cron/missedMealCheck.js';
import logger from '../utils/logger.js';

let lastMissedMealRun = null;

export function getJobs(req, res) {
    res.render("admin-jobs.ejs", { lastRun: lastMissedMealRun });
}

export async function runMissedMealJob(req, res) {
    logger.info({ ip: req.ip }, 'missed-meal manual run triggered via admin panel');
    try {
        const result = await checkMissedMeals();
        lastMissedMealRun = { ranAt: new Date(), result, error: null };
    } catch (e) {
        logger.error({ err: e.message }, 'missed-meal manual run failed');
        lastMissedMealRun = { ranAt: new Date(), result: null, error: e.message };
    }
    res.redirect("/admin/jobs");
}
