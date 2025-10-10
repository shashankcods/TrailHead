import mongoose from "mongoose";

// Define the schema (the structure for a user document)
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // Must always be provided
      unique: true, // No two users can share the same username
      trim: true, // Removes spaces before/after username
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Automatically converts emails to lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true, // Password is mandatory
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePic: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt fields
  }
);

// Create and export the model
export const User = mongoose.model("User", userSchema);
