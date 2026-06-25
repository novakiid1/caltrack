import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { userModel, userMealModel } from '../models/users.js';
import MissedMealAlert from '../models/missedMealAlert.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    }
});

const FROM_EMAIL = process.env.GMAIL_USER;

async function checkMissedMeals() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const users = await userModel.find({ 'goals.calories': { $exists: true, $gt: 0 } }).select('name email goals');

    for (const user of users) {
        const dayDoc = await userMealModel.findOne({ user: user._id, date: yesterday });
        if (dayDoc?.meals?.length) continue;

        try {
            await MissedMealAlert.create({ user: user._id, date: yesterday });
        } catch (e) {
            if (e.code === 11000) continue; // duplicate — already sent
            console.error(`MissedMealAlert insert failed for ${user.email}:`, e.message);
            continue;
        }

        const dateStr = yesterday.toLocaleDateString('en-IN', {
            weekday: 'long', month: 'long', day: 'numeric'
        });

        try {
            await transporter.sendMail({
                from:    `"CalTrack" <${FROM_EMAIL}>`,
                to:      user.email,
                subject: `CalTrack — you missed logging meals on ${dateStr}`,
                text:    `Hey ${user.name},\n\nYou didn't log any meals on ${dateStr}. Stay consistent!\n\nOpen CalTrack to log today's meals.\n\n— CalTrack`,
                html:    `
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
            console.error(`Gmail SMTP failed for ${user.email}:`, e.message);
        }
    }
}

export function startMissedMealCron() {
    // fires at midnight every day
    cron.schedule('0 0 * * *', checkMissedMeals, { timezone: 'Asia/Kolkata' });
    console.log('Missed meal cron scheduled (midnight IST)');
}

export { checkMissedMeals };
