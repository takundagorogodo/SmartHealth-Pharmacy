import mongoose from "mongoose";

const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DATABASE CONNECTED");
    } catch (error) {
        console.error("connection failed of database",error.message);
        process.exit(1);
    }
}

export default connectDb;