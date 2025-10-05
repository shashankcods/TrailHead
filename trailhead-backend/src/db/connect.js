import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    console.log("Connecting to MongoDB with URI:", uri);

    await mongoose.connect(uri);

    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
