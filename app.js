import express from 'express';
import session from 'express-session';
import ejsMate from 'ejs-mate';
import foodModel from './models/fooditems.js';
import { userModel, userMealModel } from './models/users.js';

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'caltrack-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) return res.redirect("/login");
    next();
};

const hasGoals = async (req, res, next) => {
    const user = await userModel.findById(req.session.userId).select("goals");
    if (!user.goals?.calories) return res.redirect("/setup");
    next();
};

app.get("/", (req, res) => {
    res.redirect("/home");
})

app.get("/login", (req, res) => {
    res.render("login.ejs", { error: null });
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email, password });
    if (!user) return res.render("login.ejs", { error: "invalid email or password" });
    req.session.userId = user._id;
    res.redirect("/home");
})

app.get("/register", (req, res) => {
    res.render("register.ejs", { error: null });
})

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await userModel.findOne({ email });
    if (existing) return res.render("register.ejs", { error: "email already in use" });
    const user = new userModel({ name, email, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect("/setup");
})

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
})

app.get("/setup", isLoggedIn, async (req, res) => {
    const user = await userModel.findById(req.session.userId).select("name goals");
    res.render("setup.ejs", { user });
})

app.post("/setup", isLoggedIn, async (req, res) => {
    const { calories, protein, fats, carbs, fibre } = req.body;
    await userModel.findByIdAndUpdate(req.session.userId, {
        goals: {
            calories: Number(calories),
            protein:  Number(protein),
            fats:     Number(fats),
            carbs:    Number(carbs),
            fibre:    Number(fibre)
        }
    });
    res.redirect("/home");
})

app.get("/settings", isLoggedIn, hasGoals, async (req, res) => {
    const user = await userModel.findById(req.session.userId).select("name goals");
    res.render("settings.ejs", { user });
})

app.post("/settings", isLoggedIn, hasGoals, async (req, res) => {
    const { calories, protein, fats, carbs, fibre } = req.body;
    await userModel.findByIdAndUpdate(req.session.userId, {
        goals: {
            calories: Number(calories),
            protein:  Number(protein),
            fats:     Number(fats),
            carbs:    Number(carbs),
            fibre:    Number(fibre)
        }
    });
    res.redirect("/home");
})

app.get("/home", isLoggedIn, hasGoals, async (req, res) => {
    const user = await userModel.findById(req.session.userId).select("name goals");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayDoc = await userMealModel
        .findOne({ user: req.session.userId, date: today })
        .populate("meals.mealItems.item");

    res.render("home.ejs", { user, dayDoc, error: null });
})

app.post("/home", isLoggedIn, hasGoals, async (req, res) => {
    let { fooditem, quantity, mealtype } = req.body;

    const fooditems = [].concat(fooditem).map(n => n.trim()).filter(Boolean);
    const quantities = [].concat(quantity);

    if (!fooditems.length) {
        const user   = await userModel.findById(req.session.userId).select("name goals");
        const today  = new Date(); today.setHours(0, 0, 0, 0);
        const dayDoc = await userMealModel.findOne({ user: req.session.userId, date: today }).populate("meals.mealItems.item");
        return res.render("home.ejs", { user, dayDoc, error: "add at least one food item" });
    }

    const notFound = [];
    const mealItems = await Promise.all(
        fooditems.map(async (name, i) => {
            const doc = await foodModel.findOne({ name: new RegExp(`^${name}$`, 'i') }).select("_id");
            if (!doc) { notFound.push(name); return null; }
            return { item: doc._id, quantity: Number(quantities[i]) || 1 };
        })
    );

    if (notFound.length) {
        const user   = await userModel.findById(req.session.userId).select("name goals");
        const today  = new Date(); today.setHours(0, 0, 0, 0);
        const dayDoc = await userMealModel.findOne({ user: req.session.userId, date: today }).populate("meals.mealItems.item");
        return res.render("home.ejs", { user, dayDoc, error: `food not found: ${notFound.join(', ')}` });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dayDoc = await userMealModel.findOne({ user: req.session.userId, date: today });
    if (!dayDoc) {
        dayDoc = new userMealModel({ user: req.session.userId, date: today, meals: [] });
    }

    dayDoc.meals.push({ mealtype, mealItems });
    await dayDoc.save();

    res.redirect("/home");
})

app.get('/api/foods', isLoggedIn, async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const items = await foodModel
        .find({ name: pattern })
        .select('name unit defaultWeight')
        .limit(10)
        .lean();
    res.json(items);
})

app.get("/history", isLoggedIn, hasGoals, async (req, res) => {
    const user = await userModel.findById(req.session.userId).select("name goals");

    const docs = await userMealModel
        .find({ user: req.session.userId })
        .select('date dailyTotals')
        .sort({ date: 1 });

    const history = docs.map(d => ({
        date:     d.date.toISOString().slice(0, 10),
        calories: Math.round(d.dailyTotals.calories),
        protein:  Math.round(d.dailyTotals.protein  * 10) / 10,
        fats:     Math.round(d.dailyTotals.fats     * 10) / 10,
        carbs:    Math.round(d.dailyTotals.carbs    * 10) / 10,
        fibre:    Math.round(d.dailyTotals.fibre    * 10) / 10,
    }));

    res.render('history.ejs', { user, history, goals: user.goals });
})

app.get("/meal/:mealId", isLoggedIn, hasGoals, async (req, res) => {
    const dayDoc = await userMealModel
        .findOne({ user: req.session.userId, 'meals._id': req.params.mealId })
        .populate('meals.mealItems.item');
    if (!dayDoc) return res.redirect('/home');
    const meal = dayDoc.meals.id(req.params.mealId);
    res.render('edit-meal.ejs', { meal });
})

app.post("/meal/:mealId/delete", isLoggedIn, hasGoals, async (req, res) => {
    const dayDoc = await userMealModel.findOne({
        user: req.session.userId,
        'meals._id': req.params.mealId
    });
    if (!dayDoc) return res.redirect('/home');
    dayDoc.meals.pull({ _id: req.params.mealId });
    await dayDoc.save();
    res.redirect('/home');
})

app.post("/meal/:mealId/item/:foodId/delete", isLoggedIn, hasGoals, async (req, res) => {
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
})

app.post("/meal/:mealId", isLoggedIn, hasGoals, async (req, res) => {
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
})

export default app;
