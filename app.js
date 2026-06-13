import express from 'express';
import session from 'express-session';
import foodModel from './models/fooditems.js';
import { userModel, userMealModel } from './models/users.js';

const app = express();
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

app.get("/home", isLoggedIn, hasGoals, async (req, res) => {
    const meals = await userMealModel
        .find({ user: req.session.userId })
        .sort({ date: -1 })
        .limit(4)
        .populate("mealItems.item");
    res.render("home.ejs", { meals });
})

app.post("/home", isLoggedIn, hasGoals, async (req, res) => {
    let { fooditem, quantity, mealtype } = req.body;

    const fooditems = [].concat(fooditem);
    const quantities = [].concat(quantity);

    const mealItems = await Promise.all(
        fooditems.map(async (name, i) => {
            const doc = await foodModel.findOne({ name: name.trim() }).select("_id");
            if (!doc) throw new Error(`Food item "${name}" not found in DB`);
            return { item: doc._id, quantity: Number(quantities[i]) };
        })
    );
    const meal = new userMealModel({ user: req.session.userId, mealItems, mealtype });
    await meal.save();

    res.redirect("/home");
})

export default app;
