import mongoose from 'mongoose';
import { checkMissedMeals, getDateWindow, findUsersWhoMissedMeals, sendMissedMealEmail } from './cron/missedMealCheck.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caltrack');

console.log('yesterday:', getDateWindow(-1));

const missed = await findUsersWhoMissedMeals(getDateWindow(-1));
console.log('users who missed meals:', missed);

await checkMissedMeals();
console.log('done');

const testUser = missed[0];
if (testUser) {
    const result = await(testUser, getDateWindow(-1));
    console.log('sendMissedMealEmail result:', result);
} else {
    console.log('no missed users to send email to');
}

await mongoose.disconnect();
