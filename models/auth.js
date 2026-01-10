import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    authProvider: {
      type: String,
      enum: ["firebase", "local"],
      default: "firebase",
      required: true,
    },

    firebaseUid: {
      type: String,
      index: true,
      sparse: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    lastAuthAt: {
      type: Date,
    },

    authVersion: {
      type: Number,
      default: 1,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

const Auth = mongoose.model("Auth", authSchema);
export default Auth;
