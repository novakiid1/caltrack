import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: String,
    category: String,
    unit: { type: String, enum: ['g', 'ml', 'unit'], default: 'g' },
    defaultWeight: { type: Number, default: null }, // grams per 1 unit; only used when unit='unit'
    calories: Number,
    protein: Number,
    fats: Number,
    carbs: Number,
    fibre: Number
})

const foodModel = mongoose.model("fooditem", foodSchema);
export default foodModel;