import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import foodModel from '../../models/fooditems.js';
import { userModel, userMealModel } from '../../models/users.js';
import app from '../../app.js';

const mongod = await MongoMemoryServer.create();
await mongoose.connect(mongod.getUri());

const seededFoods = await foodModel.insertMany([
    { name: 'chicken', unit: 'g',    defaultWeight: null, calories: 2,   protein: 0.3,   fats: 0.05,  carbs: 0,    fibre: 0     },
    { name: 'rice',    unit: 'g',    defaultWeight: null, calories: 1.3, protein: 0.027, fats: 0.003, carbs: 0.28, fibre: 0.004 },
    { name: 'egg',     unit: 'unit', defaultWeight: 50,   calories: 1.5, protein: 0.12,  fats: 0.1,   carbs: 0.01, fibre: 0     },
]);

// Test-only: creates a user with one day-doc containing N meals.
// Returns login credentials + metadata about the last meal.
app.post('/test/seed', async (req, res) => {
    const count = Math.min(parseInt(req.query.count || '3'), 10);
    const email = `seed_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
    const password = 'testpass';
    const mealtypes = ['breakfast', 'lunch', 'snack', 'dinner', 'breakfast', 'lunch', 'snack', 'dinner', 'breakfast', 'lunch'];

    const user = await userModel.create({
        name: 'Seed User',
        email,
        password,
        goals: { calories: 2000, protein: 150, carbs: 250, fats: 65, fibre: 30 }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meals = [];
    for (let i = 0; i < count; i++) {
        const food = seededFoods[i % seededFoods.length];
        // use realistic quantities: unit items get count (e.g. 2 eggs), g/ml get 100
        const qty = food.unit === 'unit' ? 2 : 100;
        meals.push({
            mealtype: mealtypes[i % mealtypes.length],
            mealItems: [{ item: food._id, quantity: qty }]
        });
    }

    const dayDoc = new userMealModel({ user: user._id, date: today, meals });
    await dayDoc.save();

    const lastMeal = dayDoc.meals[dayDoc.meals.length - 1];
    const lastFood = seededFoods[(count - 1) % seededFoods.length];
    const lastQty  = lastMeal.mealItems[0].quantity;

    res.json({
        email,
        password,
        count,
        latestMealtype:       lastMeal.mealtype,
        latestCalories:       Math.round(lastMeal.totals.calories),
        latestFoodName:       lastFood.name,
        latestFoodUnit:       lastFood.unit,
        latestFoodDefaultWeight: lastFood.defaultWeight ?? null,
        latestQty:            lastQty,
    });
});

app.listen(8081, () => {
    console.log('Test server running on port 8081');
});
