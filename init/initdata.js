const foods = [
    {
        name: "Poha",
        category: "Breakfast",
        calories: 290,
        protein: 7,
        fats: 6,
        carbs: 52,
        fibre: 4
    },
    {
        name: "Upma",
        category: "Breakfast",
        calories: 250,
        protein: 6,
        fats: 7,
        carbs: 40,
        fibre: 3
    },
    {
        name: "Masala Dosa",
        category: "Breakfast",
        calories: 380,
        protein: 8,
        fats: 17,
        carbs: 48,
        fibre: 4
    },
    {
        name: "Idli (2 pcs)",
        category: "Breakfast",
        calories: 140,
        protein: 5,
        fats: 1,
        carbs: 30,
        fibre: 2
    },
    {
        name: "Medu Vada",
        category: "Breakfast",
        calories: 220,
        protein: 6,
        fats: 12,
        carbs: 22,
        fibre: 3
    },
    {
        name: "Vegetable Sandwich",
        category: "Breakfast",
        calories: 280,
        protein: 9,
        fats: 8,
        carbs: 42,
        fibre: 5
    },
    {
        name: "Aloo Paratha",
        category: "Breakfast",
        calories: 320,
        protein: 8,
        fats: 12,
        carbs: 45,
        fibre: 5
    },
    {
        name: "Oats Porridge",
        category: "Breakfast",
        calories: 180,
        protein: 7,
        fats: 4,
        carbs: 30,
        fibre: 5
    },

    {
        name: "Chapati (2)",
        category: "Lunch",
        calories: 220,
        protein: 7,
        fats: 2,
        carbs: 44,
        fibre: 6
    },
    {
        name: "Cooked White Rice",
        category: "Lunch",
        calories: 390,
        protein: 8,
        fats: 1,
        carbs: 84,
        fibre: 1
    },
    {
        name: "Dal Tadka",
        category: "Lunch",
        calories: 220,
        protein: 11,
        fats: 8,
        carbs: 24,
        fibre: 7
    },
    {
        name: "Rajma Curry",
        category: "Lunch",
        calories: 320,
        protein: 15,
        fats: 10,
        carbs: 42,
        fibre: 12
    },
    {
        name: "Chole",
        category: "Lunch",
        calories: 350,
        protein: 14,
        fats: 12,
        carbs: 45,
        fibre: 11
    },
    {
        name: "Paneer Butter Masala",
        category: "Lunch",
        calories: 420,
        protein: 16,
        fats: 34,
        carbs: 12,
        fibre: 2
    },
    {
        name: "Palak Paneer",
        category: "Lunch",
        calories: 310,
        protein: 18,
        fats: 22,
        carbs: 10,
        fibre: 4
    },
    {
        name: "Vegetable Pulao",
        category: "Lunch",
        calories: 340,
        protein: 8,
        fats: 9,
        carbs: 58,
        fibre: 4
    },
    {
        name: "Sambar",
        category: "Lunch",
        calories: 140,
        protein: 6,
        fats: 3,
        carbs: 22,
        fibre: 5
    },

    {
        name: "Chicken Curry",
        category: "Dinner",
        calories: 410,
        protein: 35,
        fats: 25,
        carbs: 8,
        fibre: 1
    },
    {
        name: "Chicken Biryani",
        category: "Dinner",
        calories: 520,
        protein: 28,
        fats: 18,
        carbs: 58,
        fibre: 3
    },
    {
        name: "Egg Curry",
        category: "Dinner",
        calories: 280,
        protein: 18,
        fats: 18,
        carbs: 8,
        fibre: 2
    },
    {
        name: "Paneer Bhurji",
        category: "Dinner",
        calories: 360,
        protein: 22,
        fats: 26,
        carbs: 8,
        fibre: 2
    },
    {
        name: "Fish Curry",
        category: "Dinner",
        calories: 300,
        protein: 32,
        fats: 15,
        carbs: 5,
        fibre: 1
    },
    {
        name: "Mixed Vegetable Curry",
        category: "Dinner",
        calories: 180,
        protein: 5,
        fats: 8,
        carbs: 22,
        fibre: 6
    },

    {
        name: "Banana",
        category: "Fruit",
        calories: 105,
        protein: 1,
        fats: 0.3,
        carbs: 27,
        fibre: 3
    },
    {
        name: "Apple",
        category: "Fruit",
        calories: 95,
        protein: 0.5,
        fats: 0.3,
        carbs: 25,
        fibre: 4
    },
    {
        name: "Orange",
        category: "Fruit",
        calories: 62,
        protein: 1.2,
        fats: 0.2,
        carbs: 15,
        fibre: 3
    },
    {
        name: "Mango",
        category: "Fruit",
        calories: 135,
        protein: 1,
        fats: 0.5,
        carbs: 35,
        fibre: 4
    },
    {
        name: "Papaya",
        category: "Fruit",
        calories: 60,
        protein: 0.8,
        fats: 0.2,
        carbs: 15,
        fibre: 3
    },

    {
        name: "Boiled Eggs (3)",
        category: "Protein",
        calories: 234,
        protein: 19,
        fats: 16,
        carbs: 2,
        fibre: 0
    },
    {
        name: "Paneer",
        category: "Protein",
        calories: 265,
        protein: 18,
        fats: 20,
        carbs: 3,
        fibre: 0
    },
    {
        name: "Tofu",
        category: "Protein",
        calories: 145,
        protein: 15,
        fats: 8,
        carbs: 4,
        fibre: 2
    },
    {
        name: "Sprouts Salad",
        category: "Protein",
        calories: 120,
        protein: 9,
        fats: 1,
        carbs: 18,
        fibre: 5
    },

    {
        name: "Samosa",
        category: "Snack",
        calories: 260,
        protein: 5,
        fats: 15,
        carbs: 28,
        fibre: 3
    },
    {
        name: "Kachori",
        category: "Snack",
        calories: 300,
        protein: 6,
        fats: 18,
        carbs: 30,
        fibre: 3
    },
    {
        name: "Bhel Puri",
        category: "Snack",
        calories: 180,
        protein: 5,
        fats: 4,
        carbs: 34,
        fibre: 4
    },
    {
        name: "Roasted Peanuts",
        category: "Snack",
        calories: 170,
        protein: 7,
        fats: 14,
        carbs: 6,
        fibre: 3
    },
    {
        name: "Masala Chai",
        category: "Beverage",
        calories: 90,
        protein: 2,
        fats: 3,
        carbs: 14,
        fibre: 0
    },
    {
        name: "Lassi",
        category: "Beverage",
        calories: 190,
        protein: 8,
        fats: 6,
        carbs: 25,
        fibre: 0
    }
];
export default {food:foods};