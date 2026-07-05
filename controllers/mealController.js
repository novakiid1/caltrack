import foodModel from '../models/fooditems.js';
import { userMealModel } from '../models/users.js';

export async function getMeal(req, res) {
    const dayDoc = await userMealModel
        .findOne({ user: req.session.userId, 'meals._id': req.params.mealId })
        .populate('meals.mealItems.item');
    if (!dayDoc) return res.redirect('/home');
    const meal = dayDoc.meals.id(req.params.mealId);
    res.render('edit-meal.ejs', { meal });
}

export async function deleteMeal(req, res) {
    const dayDoc = await userMealModel.findOne({
        user: req.session.userId,
        'meals._id': req.params.mealId
    });
    if (!dayDoc) return res.redirect('/home');
    dayDoc.meals.pull({ _id: req.params.mealId });
    await dayDoc.save();
    res.redirect('/home');
}

export async function deleteMealItem(req, res) {
    const dayDoc = await userMealModel.findOne({
        user: req.session.userId,
        'meals._id': req.params.mealId
    });
    if (!dayDoc) return res.redirect('/home');
    const meal = dayDoc.meals.id(req.params.mealId);
    if (!meal) return res.redirect('/home');

    meal.mealItems = meal.mealItems.filter(
        mi => mi.item.toString() !== req.params.foodId
    );
    // last item removed → delete the whole meal
    if (meal.mealItems.length === 0) {
        dayDoc.meals.pull({ _id: req.params.mealId });
    }
    await dayDoc.save();
    res.redirect('/home');
}

export async function updateMeal(req, res) {
    let { fooditem, quantity } = req.body;

    const fooditems = [].concat(fooditem);
    const quantities = [].concat(quantity);

    // Filter out blank rows, resolve each name to _id
    const pairs = fooditems
        .map((name, i) => ({ name: name?.trim(), qty: Number(quantities[i]) }))
        .filter(p => p.name);

    const mealItems = await Promise.all(
        pairs.map(async ({ name, qty }) => {
            const doc = await foodModel.findOne({ name }).select('_id');
            if (!doc) throw new Error(`Food item "${name}" not found in DB`);
            return { item: doc._id, quantity: qty };
        })
    );

    const dayDoc = await userMealModel.findOne({
        user: req.session.userId,
        'meals._id': req.params.mealId
    });
    if (!dayDoc) return res.redirect('/home');

    // Replace entire mealItems array — handles add, edit, and remove
    const meal = dayDoc.meals.id(req.params.mealId);
    meal.mealItems = mealItems;
    await dayDoc.save();

    res.redirect('/home');
}
