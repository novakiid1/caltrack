import { userModel, userMealModel } from '../models/users.js';

export async function getHistory(req, res) {
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
}
