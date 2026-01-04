import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
],
    cart: [
  {
    type: mongoose.Schema.Types.ObjectId,   
    country: String,
    occupation: String,
  },
  { timestamps: true }
],
})
    

const User = mongoose.model("User", userSchema);
export default User;
