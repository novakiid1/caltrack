import { userModel } from '../models/users.js';

export async function getSettings(req, res) {
    const user = await userModel.findById(req.session.userId).select("name goals");
    res.render("settings.ejs", { user });
}

export async function postSettings(req, res) {
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
}
