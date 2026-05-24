import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt" 

const userSchema = new mongoose.Schema( 
  {
    username: {
      type: String,
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, 
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, 'Password is required'], 
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
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id.toString(), email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "15m" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id.toString() },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRY || "7d" }
  );
};

export const User = mongoose.model("User", userSchema);
