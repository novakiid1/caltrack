import mongoose from 'mongoose';
import './fooditems.js';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    goals: {
        calories: Number,
        protein:  Number,
        fats:     Number,
        carbs:    Number,
        fibre:    Number
    }
})

const mealSubSchema = new mongoose.Schema({
    mealtype: String,
    time: { type: Date, default: Date.now },
    mealItems: [
        {
            _id: false,
            item: { type: mongoose.Schema.Types.ObjectId, ref: "fooditem" },
            quantity: Number
        }
    ],
    totals: {
        calories: { type: Number, default: 0 },
        protein:  { type: Number, default: 0 },
        fats:     { type: Number, default: 0 },
        carbs:    { type: Number, default: 0 },
        fibre:    { type: Number, default: 0 }
    }
})

// One document per user per day. meals[] holds each logged meal.
const userMealSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    date: Date,
    meals: [mealSubSchema],
    dailyTotals: {
        calories: { type: Number, default: 0 },
        protein:  { type: Number, default: 0 },
        fats:     { type: Number, default: 0 },
        carbs:    { type: Number, default: 0 },
        fibre:    { type: Number, default: 0 }
    }
})

userMealSchema.pre("save", async function () {
    await this.populate("meals.mealItems.item");

    const daily = { calories: 0, protein: 0, fats: 0, carbs: 0, fibre: 0 };

    for (const meal of this.meals) {
        const sum = { calories: 0, protein: 0, fats: 0, carbs: 0, fibre: 0 };
        for (const mi of meal.mealItems) {
            const f = mi.item;
            const q = mi.quantity;
            // for unit items, q = number of pieces; multiply by grams-per-piece to get actual weight
            const w = (f.unit === 'unit' && f.defaultWeight) ? f.defaultWeight : 1;
            sum.calories += f.calories * q * w;
            sum.protein  += f.protein  * q * w;
            sum.fats     += f.fats     * q * w;
            sum.carbs    += f.carbs    * q * w;
            sum.fibre    += f.fibre    * q * w;
        }
        meal.totals = sum;
        daily.calories += sum.calories;
        daily.protein  += sum.protein;
        daily.fats     += sum.fats;
        daily.carbs    += sum.carbs;
        daily.fibre    += sum.fibre;
    }

    this.dailyTotals = daily;
})

const userMealModel = mongoose.model("usermeals", userMealSchema);
const userModel = mongoose.model("users", userSchema);

export { userModel, userMealModel };
