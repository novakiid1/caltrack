import { userModel } from '../models/users.js';

export const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) return res.redirect("/login");
    next();
};

export const hasGoals = async (req, res, next) => {
    const user = await userModel.findById(req.session.userId).select("goals");
    if (!user.goals?.calories) return res.redirect("/setup");
    next();
};
