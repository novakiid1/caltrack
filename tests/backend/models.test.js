import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { userModel, userMealModel } from '../../models/users.js';
import foodModel from '../../models/fooditems.js';
import { setupDB, teardownDB, clearDB, seedFoodItems } from '../helpers/db.js';

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

describe('UserMeal pre-save hook', () => {
    beforeAll(setupDB);
    afterAll(teardownDB);
    beforeEach(async () => { await clearDB(); await seedFoodItems(); });

    it('calculates totals for a single item', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });

        const dayDoc = new userMealModel({
            user: user._id,
            date: startOfToday(),
            meals: [{ mealtype: 'lunch', mealItems: [{ item: chicken._id, quantity: 100 }] }]
        });
        await dayDoc.save();

        expect(dayDoc.meals[0].totals.calories).toBeCloseTo(200);   // 200/100 * 100g
        expect(dayDoc.meals[0].totals.protein).toBeCloseTo(30);     // 30/100 * 100g
        expect(dayDoc.meals[0].totals.fats).toBeCloseTo(5);         // 5/100 * 100g
        expect(dayDoc.meals[0].totals.carbs).toBeCloseTo(0);
    });

    it('sums daily totals across multiple meals', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        const rice    = await foodModel.findOne({ name: 'rice' });

        const dayDoc = new userMealModel({
            user: user._id,
            date: startOfToday(),
            meals: [
                { mealtype: 'breakfast', mealItems: [{ item: chicken._id, quantity: 100 }] },
                { mealtype: 'lunch',     mealItems: [{ item: rice._id,    quantity: 200 }] },
            ]
        });
        await dayDoc.save();

        // breakfast: 200/100*100=200, lunch: 130/100*200=260 → daily: 460
        expect(dayDoc.dailyTotals.calories).toBeCloseTo(460);
        // Each meal's own totals are also calculated
        expect(dayDoc.meals[0].totals.calories).toBeCloseTo(200);
        expect(dayDoc.meals[1].totals.calories).toBeCloseTo(260);
    });

    it('recalculates daily totals when a new meal is pushed and re-saved', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        const rice    = await foodModel.findOne({ name: 'rice' });
        const today   = startOfToday();

        const dayDoc = new userMealModel({
            user: user._id, date: today,
            meals: [{ mealtype: 'breakfast', mealItems: [{ item: chicken._id, quantity: 100 }] }]
        });
        await dayDoc.save();
        expect(dayDoc.dailyTotals.calories).toBeCloseTo(200);

        dayDoc.meals.push({ mealtype: 'lunch', mealItems: [{ item: rice._id, quantity: 100 }] });
        await dayDoc.save();
        // 200 + 130/100*100 = 330
        expect(dayDoc.dailyTotals.calories).toBeCloseTo(330);
    });

    it('stores mealtype on each meal subdoc', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        const dayDoc = new userMealModel({
            user: user._id, date: startOfToday(),
            meals: [{ mealtype: 'breakfast', mealItems: [{ item: chicken._id, quantity: 50 }] }]
        });
        await dayDoc.save();
        expect(dayDoc.meals[0].mealtype).toBe('breakfast');
    });

    it('mealItems have no _id field', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        const dayDoc = new userMealModel({
            user: user._id, date: startOfToday(),
            meals: [{ mealtype: 'snack', mealItems: [{ item: chicken._id, quantity: 50 }] }]
        });
        await dayDoc.save();
        expect(dayDoc.meals[0].mealItems[0]._id).toBeUndefined();
    });

    it('ties day document to correct user', async () => {
        const userA = await userModel.create({ name: 'A', email: 'a@t.com', password: 'pw' });
        const userB = await userModel.create({ name: 'B', email: 'b@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        await userMealModel.create({
            user: userA._id, date: startOfToday(),
            meals: [{ mealtype: 'lunch', mealItems: [{ item: chicken._id, quantity: 50 }] }]
        });

        const docsB = await userMealModel.find({ user: userB._id });
        expect(docsB).toHaveLength(0);
    });
});
