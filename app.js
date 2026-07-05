import express from 'express';
import session from 'express-session';
import ejsMate from 'ejs-mate';
import { startMissedMealCron } from './cron/missedMealCheck.js';

import homeRoutes from './routes/homeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import setupRoutes from './routes/setupRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'caltrack-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(homeRoutes);
app.use(authRoutes);
app.use(setupRoutes);
app.use(settingsRoutes);
app.use(foodRoutes);
app.use(historyRoutes);
app.use('/meal', mealRoutes);
app.use('/admin', adminRoutes);

if (process.env.NODE_ENV !== 'test') {
    startMissedMealCron();
}

export default app;
