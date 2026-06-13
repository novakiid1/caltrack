import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import foodModel from '../../models/fooditems.js';
import app from '../../app.js';

const mongod = await MongoMemoryServer.create();
await mongoose.connect(mongod.getUri());

await foodModel.insertMany([
    { name: 'chicken', calories: 2,   protein: 0.3,   fats: 0.05,  carbs: 0,    fibre: 0     },
    { name: 'rice',    calories: 1.3, protein: 0.027, fats: 0.003, carbs: 0.28, fibre: 0.004 },
    { name: 'egg',     calories: 1.5, protein: 0.12,  fats: 0.1,   carbs: 0.01, fibre: 0     },
]);

app.listen(8081, () => {
    console.log('Test server running on port 8081');
});
