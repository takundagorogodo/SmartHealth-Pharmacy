import mongoose from "mongoose";

export const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console,log("DATABASE CONNECTED");
    } catch (error) {
        console.error("connection failed",error.message);
        process.exit(1);
    }
}