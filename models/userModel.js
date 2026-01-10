import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows null but keeps unique
      index: true,
    },

    password: {
      type: String,
      select: false, // ❗ Firebase users don’t need it
    },

    authProvider: {
      type: String,
      enum: ["firebase", "local"],
      default: "firebase",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    /* ================= WISHLIST ================= */
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    /* ================= CART ================= */
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        size: String,
        color: String,
      },
    ],

    /* ================= PROFILE INFO ================= */
    country: String,
    occupation: String,

    /* ================= ACCOUNT STATUS ================= */
    isBlocked: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
