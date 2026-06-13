import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import foodModel from './models/fooditems.js';
import { userModel, userMealModel } from './models/users.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'caltrack-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }  // 1 day
}));

const mongodbUrl = "mongodb://localhost:27017/caltrack";

async function main() {
    await mongoose.connect(mongodbUrl);
}

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) return res.redirect("/login");
    next();
};

app.get("/", (req, res) => {
    res.redirect("/home");
})

// --- auth routes ---

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
    res.redirect("/home");
})

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
})

// --- home routes ---

app.get("/home", isLoggedIn, async (req, res) => {
    const meals = await userMealModel.find({ user: req.session.userId }).sort({ date: -1 });
    res.render("home.ejs", { meals });
})

app.post("/home", isLoggedIn, async (req, res) => {
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

app.listen(8080, () => {
    console.log(`the server is running on port 8080`);
});
