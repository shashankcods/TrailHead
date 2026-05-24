import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Connecting to MongoDB with URI:", uri);

    const connectionInstance = await mongoose.connect(uri, {
      dbName: "trailhead",
      ssl: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`MongoDB connected successfully to database!! DB HOST: ${connectionInstance.connection.host}`, );
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1)
  }
} 

export default connectDB;