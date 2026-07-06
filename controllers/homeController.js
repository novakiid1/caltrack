import foodModel from '../models/fooditems.js';
import { userModel, userMealModel } from '../models/users.js';

function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

async function loadHomeData(userId) {
    const user = await userModel.findById(userId).select("name goals");
    const dayDoc = await userMealModel
        .findOne({ user: userId, date: startOfToday() })
        .populate("meals.mealItems.item");
    return { user, dayDoc };
}

export async function getHome(req, res) {
    const { user, dayDoc } = await loadHomeData(req.session.userId);
    res.render("home.ejs", { user, dayDoc, error: null });
}

export async function postHome(req, res) {
    let { fooditem, quantity, mealtype } = req.body;

    const fooditems = [].concat(fooditem).map(n => n.trim()).filter(Boolean);
    const quantities = [].concat(quantity);

    if (!fooditems.length) {
        const { user, dayDoc } = await loadHomeData(req.session.userId);
        return res.render("home.ejs", { user, dayDoc, error: "add at least one food item" });
    }

    const notFound = [];
    const mealItems = await Promise.all(
        fooditems.map(async (name, i) => {
            const doc = await foodModel.findOne({ name: new RegExp(`^${name}$`, 'i') }).select("_id");
            if (!doc) { notFound.push(name); return null; }
            const qty = Number(quantities[i]);
            return { item: doc._id, quantity: qty > 0 ? qty : 1 };
        })
    );

    if (notFound.length) {
        const { user, dayDoc } = await loadHomeData(req.session.userId);
        return res.render("home.ejs", { user, dayDoc, error: `food not found: ${notFound.join(', ')}` });
    }

    const today = startOfToday();
    let dayDoc = await userMealModel.findOne({ user: req.session.userId, date: today });
    if (!dayDoc) {
        dayDoc = new userMealModel({ user: req.session.userId, date: today, meals: [] });
    }

    dayDoc.meals.push({ mealtype, mealItems });
    await dayDoc.save();

    res.redirect("/home");
}
