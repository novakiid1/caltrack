import foodModel from '../models/fooditems.js';
import logger from '../utils/logger.js';

export async function listFoods(req, res) {
    const foods = await foodModel.find().sort({ name: 1 }).lean();
    res.render('admin-foods.ejs', { foods });
}

export async function editFoodForm(req, res) {
    const food = await foodModel.findById(req.params.id).lean();
    if (!food) return res.redirect('/admin/foods');
    res.render('admin-food-edit.ejs', { food });
}

export async function updateFood(req, res) {
    const { name, category, unit, defaultWeight, calories, protein, fats, carbs, fibre } = req.body;
    try {
        await foodModel.findByIdAndUpdate(req.params.id, {
            name,
            category,
            unit,
            defaultWeight: defaultWeight ? Number(defaultWeight) : null,
            calories: Number(calories),
            protein: Number(protein),
            fats: Number(fats),
            carbs: Number(carbs),
            fibre: Number(fibre),
        });
        res.redirect('/admin/foods');
    } catch (e) {
        logger.error({ err: e.message, foodId: req.params.id }, 'failed to update food item');
        res.status(400).send('Failed to update food item: ' + e.message);
    }
}
