import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { userModel, userMealModel } from '../../models/users.js';
import foodModel from '../../models/fooditems.js';
import { setupDB, teardownDB, clearDB, seedFoodItems } from '../helpers/db.js';

describe('UserMeal pre-save hook', () => {
    beforeAll(setupDB);
    afterAll(teardownDB);
    beforeEach(async () => { await clearDB(); await seedFoodItems(); });

    it('calculates totals for a single item', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        const meal = new userMealModel({
            user: user._id,
            mealItems: [{ item: chicken._id, quantity: 100 }],
            mealtype: 'lunch'
        });
        await meal.save();

        expect(meal.totals.calories).toBeCloseTo(200);   // 2 * 100
        expect(meal.totals.protein).toBeCloseTo(30);     // 0.3 * 100
        expect(meal.totals.fats).toBeCloseTo(5);         // 0.05 * 100
        expect(meal.totals.carbs).toBeCloseTo(0);
    });

    it('sums totals across multiple items', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        const rice    = await foodModel.findOne({ name: 'rice' });
        const meal = new userMealModel({
            user: user._id,
            mealItems: [
                { item: chicken._id, quantity: 100 },
                { item: rice._id,    quantity: 200 },
            ],
            mealtype: 'lunch'
        });
        await meal.save();

        // chicken: 2*100=200, rice: 1.3*200=260 → 460
        expect(meal.totals.calories).toBeCloseTo(460);
        // protein: 0.3*100 + 0.027*200 = 30 + 5.4 = 35.4
        expect(meal.totals.protein).toBeCloseTo(35.4);
    });

    it('stores mealtype', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        const meal = new userMealModel({
            user: user._id,
            mealItems: [{ item: chicken._id, quantity: 50 }],
            mealtype: 'breakfast'
        });
        await meal.save();
        expect(meal.mealtype).toBe('breakfast');
    });

    it('mealItems have no _id field', async () => {
        const user = await userModel.create({ name: 'T', email: 't@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        const meal = new userMealModel({
            user: user._id,
            mealItems: [{ item: chicken._id, quantity: 50 }],
            mealtype: 'snack'
        });
        await meal.save();
        expect(meal.mealItems[0]._id).toBeUndefined();
    });

    it('ties meal to correct user', async () => {
        const userA = await userModel.create({ name: 'A', email: 'a@t.com', password: 'pw' });
        const userB = await userModel.create({ name: 'B', email: 'b@t.com', password: 'pw' });
        const chicken = await foodModel.findOne({ name: 'chicken' });
        await userMealModel.create({ user: userA._id, mealItems: [{ item: chicken._id, quantity: 50 }], mealtype: 'lunch' });

        const mealsB = await userMealModel.find({ user: userB._id });
        expect(mealsB).toHaveLength(0);
    });
});
