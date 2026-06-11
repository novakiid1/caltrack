import express from 'express';
import mongoose from 'mongoose';
import foodModel from './models/fooditems.js';
const app = express();
app.use(express.urlencoded({ extended: true }));
const mongodbUrl = "mongodb://localhost:27017/caltrack";

async function main() {
    await mongoose.connect(mongodbUrl);
}

main().then((result) => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

app.get("/", (req, res) => {
    res.send("root")
})

app.get("/home", (req, res) => {
    res.render("home.ejs")
})

app.post("/home", async (req, res) => {
    let { fooditem, quantity } = await req.body;
    let foodid = await foodModel.findOne({ name: fooditem }).select("_id");
    console.log(fooditem);
    console.log(foodid);
    // console.log(quantity);
    // console.log(req.body);

    res.render("home.ejs")
})

app.listen(8080, () => {
    console.log(`the server is running on port 8080`);
});