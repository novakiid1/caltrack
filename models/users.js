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

const userMealSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    name: String,
    mealItems: [
        {
            _id: false,
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "fooditem"
            },
            quantity: Number
        }
    ],
    totals: {
        calories: { type: Number, default: 0 },
        protein:  { type: Number, default: 0 },
        fats:     { type: Number, default: 0 },
        carbs:    { type: Number, default: 0 },
        fibre:    { type: Number, default: 0 }
    },
    mealtype: String,
    date: {
        type: Date,
        default: Date.now
    }
})

userMealSchema.pre("save", async function () {
    await this.populate("mealItems.item");
    const sum = { calories: 0, protein: 0, fats: 0, carbs: 0, fibre: 0 };
    for (const mi of this.mealItems) {
        const f = mi.item;
        const q = mi.quantity;
        sum.calories += f.calories * q;
        sum.protein  += f.protein  * q;
        sum.fats     += f.fats     * q;
        sum.carbs    += f.carbs    * q;
        sum.fibre    += f.fibre    * q;
    }
    this.totals = sum;
})

const userMealModel = mongoose.model("usermeals", userMealSchema);
const userModel = mongoose.model("users", userSchema);

export { userModel, userMealModel };
