import { checkMissedMeals, findUsersWhoMissedMeals, getDateWindow } from '../cron/missedMealCheck.js';
import MissedMealAlert from '../models/missedMealAlert.js';
import logger from '../utils/logger.js';

let lastMissedMealRun = null;

export async function getJobs(req, res) {
    try {
        const missedDate = getDateWindow(-1);
        const missedMeals = await findUsersWhoMissedMeals(missedDate);

        const alerts = await MissedMealAlert.find({
            date: missedDate,
            user: { $in: missedMeals.map(u => u._id) }
        }).select('user');
        const alertedIds = new Set(alerts.map(a => a.user.toString()));

        // only show users who missed meals AND haven't already been emailed for this date
        const missedUsers = missedMeals.filter(u => !alertedIds.has(u._id.toString()));

        res.render("admin-jobs.ejs", { lastRun: lastMissedMealRun, missedUsers, missedDate });
    } catch (e) {
        logger.error({ err: e.message }, 'failed to render admin jobs page');
        res.status(500).send('Failed to load admin page');
    }
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
