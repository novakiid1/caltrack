import cron from 'node-cron';
import nodemailer from 'nodemailer';
import MissedMealAlert from '../models/missedMealAlert.js';
import { userMealModel, userModel } from '../models/users.js';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    }
});

// ── 1. Time window ────────────────────────────────────────────────
// Returns start-of-day Date for any offset from today.
// offset=0 → today, offset=-1 → yesterday (default)
export function getDateWindow(offsetDays = -1) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(0, 0, 0, 0);
    return d;
}

// ── 2. Find users who missed meals on a given date ────────────────
// Returns array of user docs that have no meals logged on `date`.
export async function findUsersWhoMissedMeals(date) {
    const users = await userModel
        .find({ 'goals.calories': { $exists: true, $gt: 0 } })
        .select('name email');

    const missed = [];
    for (const user of users) {
        const dayDoc = await userMealModel.findOne({ user: user._id, date });
        if (!dayDoc?.meals?.length) missed.push(user);
    }

    return missed;
}

// ── 3. Send email to one user for one missed date ─────────────────
// mailer param allows injecting a mock in tests.
// Returns { sent: true } or { sent: false, reason: 'duplicate' | 'error', message? }
export async function sendMissedMealEmail(user, date, mailer = transporter) {
    const existing = await MissedMealAlert.findOne({ user: user._id, date });
    if (existing) return { sent: false, reason: 'duplicate' };

    const dateStr = date.toLocaleDateString('en-IN', {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    try {
        await mailer.sendMail({
            from: `"CalTrack" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: `CalTrack — you missed logging meals on ${dateStr}`,
            text: `Hey ${user.name},\n\nYou didn't log any meals on ${dateStr}. Stay consistent!\n\nOpen CalTrack to log today's meals.\n\n— CalTrack`,
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f172a;color:#f1f5f9;border-radius:12px">
                    <h2 style="color:#22c55e;margin-top:0">CalTrack</h2>
                    <p>Hey <strong>${user.name}</strong>,</p>
                    <p>Looks like you didn't log any meals on <strong>${dateStr}</strong>.</p>
                    <p>Staying consistent is key to hitting your goals. Log today's meals to get back on track.</p>
                    <p style="color:#94a3b8;font-size:0.8rem;margin-top:32px">You're receiving this because you have a CalTrack account.</p>
                </div>
            `
        });
    } catch (e) {
        logger.error({ userId: user._id, email: user.email, err: e.message }, 'missed-meal email send failed');
        return { sent: false, reason: 'error', message: e.message };
    }

    await MissedMealAlert.create({ user: user._id, date });
    logger.info({ userId: user._id, email: user.email }, 'missed-meal email sent');
    return { sent: true };
}

// ── 4. Orchestrator ───────────────────────────────────────────────
export async function checkMissedMeals() {
    const startedAt = Date.now();
    const yesterday = getDateWindow(-1);
    logger.info({ windowDate: yesterday.toISOString() }, 'missed-meal check started');

    const users = await findUsersWhoMissedMeals(yesterday);

    const summary = { date: yesterday, usersChecked: users.length, sent: 0, skipped: 0, errors: [] };
    for (const user of users) {
        const result = await sendMissedMealEmail(user, yesterday);
        if (result.sent) summary.sent++;
        else if (result.reason === 'duplicate') summary.skipped++;
        else summary.errors.push({ email: user.email, message: result.message });
    }

    logger.info({
        ...summary,
        errors: summary.errors.length,
        durationMs: Date.now() - startedAt,
    }, 'missed-meal check finished');

    return summary;
}

// ── 5. Cron starter ───────────────────────────────────────────────
export function startMissedMealCron() {
    cron.schedule('0 0 * * *', () => {
        logger.info({
            firedAtUtc: new Date().toISOString(),
            firedAtIst: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        }, 'missed-meal cron fired');
        checkMissedMeals();
    }, { timezone: 'Asia/Kolkata' });

    logger.info({
        cronExpression: '0 0 * * *',
        cronTimezone: 'Asia/Kolkata',
        processTz: process.env.TZ || null,
        resolvedSystemTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }, 'missed-meal cron scheduled');
}
