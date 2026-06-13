import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import foodModel from '../../models/fooditems.js';
import { userModel, userMealModel } from '../../models/users.js';
import app from '../../app.js';

const mongod = await MongoMemoryServer.create();
await mongoose.connect(mongod.getUri());

const seededFoods = await foodModel.insertMany([
    { name: 'chicken', calories: 2,   protein: 0.3,   fats: 0.05,  carbs: 0,    fibre: 0     },
    { name: 'rice',    calories: 1.3, protein: 0.027, fats: 0.003, carbs: 0.28, fibre: 0.004 },
    { name: 'egg',     calories: 1.5, protein: 0.12,  fats: 0.1,   carbs: 0.01, fibre: 0     },
]);

// Test-only: creates a user with pre-seeded meals, returns login credentials + expected values.
// Accepts ?count=N (default 3, max 10).
app.post('/test/seed', async (req, res) => {
    const count = Math.min(parseInt(req.query.count || '3'), 10);
    const email = `seed_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
    const password = 'testpass';
    const mealtypes = ['breakfast', 'lunch', 'snack', 'dinner'];

    const user = await userModel.create({
        name: 'Seed User',
        email,
        password,
        goals: { calories: 2000, protein: 150, carbs: 250, fats: 65, fibre: 30 }
    });

    let latestMeal = null;
    for (let i = 0; i < count; i++) {
        const food = seededFoods[i % seededFoods.length];
        const meal = new userMealModel({
            user: user._id,
            mealItems: [{ item: food._id, quantity: 100 }],
            mealtype: mealtypes[i % mealtypes.length]
        });
        await meal.save();
        latestMeal = meal;
    }

    res.json({
        email,
        password,
        count,
        latestMealtype: latestMeal.mealtype,
        latestCalories: latestMeal.totals.calories,
        latestFoodName: seededFoods[(count - 1) % seededFoods.length].name,
    });
});

app.listen(8081, () => {
    console.log('Test server running on port 8081');
});
