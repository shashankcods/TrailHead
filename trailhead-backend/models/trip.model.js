import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    tripDays: {
      type: Number,
      required: true,
    },
    adults: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["saved", "upcoming", "completed"],
      default: "saved",
    },
    plannerData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export const Trip = mongoose.model("Trip", tripSchema);
