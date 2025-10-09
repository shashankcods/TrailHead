import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Connecting to MongoDB with URI:", uri);

    await mongoose.connect(uri, {
      dbName: "trailhead",
      ssl: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully to database:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}
