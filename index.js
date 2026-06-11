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
    let { fooditem, quantity } = req.body;

    // normalize to arrays (single item comes as a string)
    const fooditems = [].concat(fooditem);
    const quantities = [].concat(quantity);

    const results = await Promise.all(
        fooditems.map((name, i) =>
            foodModel.findOne({ name }).select("_id name").then(doc => ({
                food: doc,
                quantity: quantities[i]
            }))
        )
    );

    console.log(results);
    res.render("home.ejs", { results })
})

app.listen(8080, () => {
    console.log(`the server is running on port 8080`);
});