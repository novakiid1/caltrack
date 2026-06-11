import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: String,
    category: String,
    calories: Number,
    protein: Number,
    fats: Number,
    carbs: Number,
    fibre: Number
})

const foodModel = mongoose.model("fooditem", foodSchema);
export default foodModel;