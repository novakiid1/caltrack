import foodModel from '../models/fooditems.js';

export async function searchFoods(req, res) {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const items = await foodModel
        .find({ name: pattern })
        .select('name unit defaultWeight')
        .limit(10)
        .lean();
    res.json(items);
}
