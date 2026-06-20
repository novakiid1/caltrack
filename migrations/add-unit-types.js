import mongoose from 'mongoose';
import foodModel from '../models/fooditems.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/caltrack';

await mongoose.connect(MONGODB_URI);
console.log('connected to DB');

const total = await foodModel.countDocuments();
console.log(`found ${total} food items`);

// 1. Reset all to 'g' solid default
await foodModel.updateMany({}, { $set: { unit: 'g', defaultWeight: null } });

// 2. Liquids → 'ml'  (no defaultWeight needed — user enters ml directly)
const liquidPattern = /milk|juice|water|tea|coffee|oil|soup|broth|shake|smoothie|lassi|buttermilk|soda|drink|beverage|beer|wine|spirits/i;
const mlResult = await foodModel.updateMany(
    { name: liquidPattern },
    { $set: { unit: 'ml' } }
);

// 3. Countable items → 'unit' + their defaultWeight (grams per piece)
const unitItems = [
    { pattern: /^egg/i,                                     defaultWeight: 50  },
    { pattern: /^(roti|chapati)/i,                          defaultWeight: 35  },
    { pattern: /^paratha/i,                                 defaultWeight: 60  },
    { pattern: /^idli/i,                                    defaultWeight: 40  },
    { pattern: /^dosa/i,                                    defaultWeight: 80  },
    { pattern: /^samosa/i,                                  defaultWeight: 50  },
    { pattern: /^(wrap|tortilla)/i,                         defaultWeight: 45  },
    { pattern: /^(bread|toast|slice)/i,                     defaultWeight: 30  },
    { pattern: /^(biscuit|cookie)/i,                        defaultWeight: 12  },
    { pattern: /^apple/i,                                   defaultWeight: 150 },
    { pattern: /^banana/i,                                  defaultWeight: 120 },
    { pattern: /^orange/i,                                  defaultWeight: 130 },
    { pattern: /^mango/i,                                   defaultWeight: 200 },
    { pattern: /^grape/i,                                   defaultWeight: 5   },
    { pattern: /^(piece|bowl|plate|serving|bar|scoop)/i,    defaultWeight: 100 },
];

let unitCount = 0;
for (const { pattern, defaultWeight } of unitItems) {
    const r = await foodModel.updateMany(
        { name: pattern },
        { $set: { unit: 'unit', defaultWeight } }
    );
    unitCount += r.modifiedCount;
}

console.log(`set 'ml'   → ${mlResult.modifiedCount} items`);
console.log(`set 'unit' → ${unitCount} items (with defaultWeight)`);
console.log(`set 'g'    → ${total - mlResult.modifiedCount - unitCount} items`);

// Show final state
const all = await foodModel.find({}).select('name unit defaultWeight').sort({ name: 1 });
console.log('\nfinal assignments:');
all.forEach(f => {
    const wStr = f.defaultWeight ? ` (${f.defaultWeight}g/unit)` : '';
    console.log(`  ${f.name.padEnd(30)} → ${f.unit}${wStr}`);
});

await mongoose.disconnect();
console.log('\nmigration complete');
