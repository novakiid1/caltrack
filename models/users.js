import mongoose from 'mongoose';

const mongodbURL = "mongodb://localhost:27017/caltrack";



main()
    .then((result) => {
        console.log("connected to db and data has been successfully initialized");
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(mongodbURL);
    // await insertUser();
}

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const userMealSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    name: String,
    mealItems: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "fooditems"
            },
            quantity: Number
        }
    ],
    totals: {
        calories: { type: Number, default: 0 },
        protein:  { type: Number, default: 0 },
        fats:     { type: Number, default: 0 },
        carbs:    { type: Number, default: 0 },
        fibre:    { type: Number, default: 0 }
    },
    mealtype: String,
    date: {
        type: Date,
        default: Date.now
    }
})

userMealSchema.pre("save", async function () {
    await this.populate("mealItems.item");
    const sum = { calories: 0, protein: 0, fats: 0, carbs: 0, fibre: 0 };
    for (const mi of this.mealItems) {
        const f = mi.item;
        const q = mi.quantity;
        sum.calories += f.calories * q;
        sum.protein  += f.protein  * q;
        sum.fats     += f.fats     * q;
        sum.carbs    += f.carbs    * q;
        sum.fibre    += f.fibre    * q;
    }
    this.totals = sum;
})

const userMealModel = mongoose.model("usermeals", userMealSchema);
const userModel = mongoose.model("users", userSchema);


const user1 = new userModel({
    name: "naman",
    email: "thisismyemail@mail.com",
    password: "thisismypassword"
});

let userdata = user1.save();



// const userMeal=new userMealSchema({
//     user:user1,
//     name:"lunch",
//     meal:,
// });
export default { userModel, userMealModel };



// calories: Number,
//     protein: Number,
//     fats: Number,
//     carbs: Number,
//     fibre: Number


// mealitem1 = {
//     item: refId,
//     quantity: 1,
// }