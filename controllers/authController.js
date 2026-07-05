import { userModel } from '../models/users.js';

export function getLogin(req, res) {
    res.render("login.ejs", { error: null });
}

export async function postLogin(req, res) {
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
        return res.render("login.ejs", { error: "email and password are required" });
    }
    const user = await userModel.findOne({ email, password });
    if (!user) return res.render("login.ejs", { error: "invalid email or password" });
    req.session.userId = user._id;
    res.redirect("/home");
}

export function getRegister(req, res) {
    res.render("register.ejs", { error: null });
}

export async function postRegister(req, res) {
    const { name, email, password } = req.body;
    const existing = await userModel.findOne({ email });
    if (existing) return res.render("register.ejs", { error: "email already in use" });
    const user = new userModel({ name, email, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect("/setup");
}

export function logout(req, res) {
    req.session.destroy();
    res.redirect("/login");
}
