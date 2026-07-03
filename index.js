import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const mongodbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/caltrack";

async function main() {
    await mongoose.connect(mongodbUrl);
}

main().then(() => {
    console.log("connected to db");
    app.listen(process.env.PORT || 8080, () => {
        console.log("the server is running on port 8080");
    });
}).catch((err) => {
    console.log(err);
});
