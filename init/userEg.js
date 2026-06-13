// import mongoose from "mongoose";
// import { userModel, userMealModel } from "./models/users.js";

// await mongoose.connect("mongodb://localhost:27017/caltrack");

// // 1. Create user
// const user = await userModel.create({
//     name: "Naman",
//     email: "naman@mail.com",
//     password: "hashedpassword123"
// });

// console.log("User created:", user._id);

// // 2. Create 4 meals — pre-save hook auto-calculates totals
// const breakfast = await userMealModel.create({
//     user: user._id,
//     name: "Breakfast",
//     mealtype: "breakfast",
//     mealItems: [
//         { item: POHA, quantity: 1 },
//         { item: UPMA, quantity: 1 }
//     ]
// });

// const lunch = await userMealModel.create({
//     user: user._id,
//     name: "Lunch",
//     mealtype: "lunch",
//     mealItems: [
//         { item: MASALA_DOSA, quantity: 2 }
//     ]
// });

// const snack = await userMealModel.create({
//     user: user._id,
//     name: "Evening Snack",
//     mealtype: "snack",
//     mealItems: [
//         { item: POHA, quantity: 1 }
//     ]
// });

// const dinner = await userMealModel.create({
//     user: user._id,
//     name: "Dinner",
//     mealtype: "dinner",
//     mealItems: [
//         { item: MASALA_DOSA, quantity: 1 },
//         { item: UPMA, quantity: 1 }
//     ]
// });

// console.log("Meals created:");
// console.log("breakfast totals:", breakfast.totals);  // { calories: 540, ... }
// console.log("lunch totals:",     lunch.totals);      // { calories: 760, ... }
// console.log("snack totals:",     snack.totals);      // { calories: 290, ... }
// console.log("dinner totals:",    dinner.totals);     // { calories: 630, ... }

// await mongoose.disconnect();
