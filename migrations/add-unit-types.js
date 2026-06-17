import mongoose from 'mongoose';
import foodModel from '../models/fooditems.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/caltrack';

await mongoose.connect(MONGODB_URI);
console.log('connected to DB');

const total = await foodModel.countDocuments();
console.log(`found ${total} food items`);

// 1. Set all items to 'g' (solid default)
await foodModel.updateMany({}, { $set: { unit: 'g' } });

// 2. Liquids → 'ml'
const liquidPattern = /milk|juice|water|tea|coffee|oil|soup|broth|shake|smoothie|lassi|buttermilk|soda|drink|beverage|beer|wine|spirits/i;
const mlResult = await foodModel.updateMany(
    { name: liquidPattern },
    { $set: { unit: 'ml' } }
);

// 3. Countable items → 'unit'
const unitPattern = /^(apple|banana|orange|mango|grape|egg|bread|biscuit|cookie|roti|chapati|paratha|idli|dosa|samosa|wrap|tortilla|slice|piece|bowl|plate|serving|bar|scoop)/i;
const unitResult = await foodModel.updateMany(
    { name: unitPattern },
    { $set: { unit: 'unit' } }
);

console.log(`set 'ml'   → ${mlResult.modifiedCount} items`);
console.log(`set 'unit' → ${unitResult.modifiedCount} items`);
console.log(`set 'g'    → ${total - mlResult.modifiedCount - unitResult.modifiedCount} items`);

// Print final state
const all = await foodModel.find({}).select('name unit').sort({ name: 1 });
console.log('\nfinal assignments:');
all.forEach(f => console.log(`  ${f.name.padEnd(30)} → ${f.unit}`));

await mongoose.disconnect();
console.log('\nmigration complete');
