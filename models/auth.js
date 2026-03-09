import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

/* Hash password */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/* Match password */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

/* Generate token */
userSchema.methods.generateToken = function (fieldName) {
  const token = crypto.randomBytes(32).toString("hex");

  this[fieldName] = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return token;
};
export default mongoose.model("User", userSchema);
