import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
      index: true,
    },

    /* ================= AUTH ================= */
    password: {
      type: String,
      required: true,
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["local"],
      default: "local",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    /* ================= ROLE ================= */
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
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

    /* ================= PROFILE ================= */
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

/* =====================================================
   🔐 PASSWORD HASHING
===================================================== */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* =====================================================
   🔍 COMPARE PASSWORD
===================================================== */
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/* =====================================================
   🔑 GENERATE TOKEN (EMAIL / RESET)
===================================================== */
userSchema.methods.generateToken = function (fieldName) {
  const token = crypto.randomBytes(32).toString("hex");

  this[fieldName] = crypto.createHash("sha256").update(token).digest("hex");

  return token;
};

const User = mongoose.model("User", userSchema);
export default User;
