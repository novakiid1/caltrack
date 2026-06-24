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
        { name: 'chicken', unit: 'g',    calories: 200,  protein: 30,   fats: 5,    carbs: 0,    fibre: 0    },
        { name: 'rice',    unit: 'g',    calories: 130,  protein: 2.7,  fats: 0.3,  carbs: 28,   fibre: 0.4  },
    ]);
}
