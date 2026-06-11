import mongoose from "mongoose";
import express from "express";
import initdata from "./initdata.js";
import fooditems from "../models/fooditems.js";
import user from "../models/users.js"

const mongodbURL = "mongodb://localhost:27017/caltrack";
const app=express();

const insertdb=async(req,res)=>{
    await fooditems.deleteMany({});
    await fooditems.insertMany(initdata.food);
}

const insertUser=async(req,res)=>{
    await user.deleteMany({});
    await user.insertOne(user);
}

main()
    .then((result) => {
        console.log("connected to db and data has been successfully initialized");
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(mongodbURL);
    await insertdb();
}
