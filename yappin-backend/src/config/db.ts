import mongoose from "mongoose";

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("Env variables not set properly!");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("MongoDB connected");
    } catch (err) {
        console.error(`MongoDB connection error: ${(err as Error).message}`);
        process.exit(1);
    }
};

export default connectDB;
