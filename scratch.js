import mongoose from 'mongoose';
import { checkMissedMeals, getDateWindow, findUsersWhoMissedMeals } from './cron/missedMealCheck.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caltrack');

console.log('yesterday:', getDateWindow(-1));

const missed = await findUsersWhoMissedMeals(getDateWindow(-1));
console.log('users who missed meals:', missed);

await checkMissedMeals();
console.log('done');

await mongoose.disconnect();
