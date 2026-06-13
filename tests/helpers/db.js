import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import foodModel from '../../models/fooditems.js';

let mongod;

export async function setupDB() {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
}

export async function teardownDB() {
    await mongoose.disconnect();
    await mongod.stop();
}

export async function clearDB() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

export async function seedFoodItems() {
    await foodModel.insertMany([
        { name: 'chicken', calories: 2, protein: 0.3, fats: 0.05, carbs: 0,    fibre: 0     },
        { name: 'rice',    calories: 1.3, protein: 0.027, fats: 0.003, carbs: 0.28, fibre: 0.004 },
    ]);
}
