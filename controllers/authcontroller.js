import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import {
  verifyEmailTemplate,
  resetPasswordTemplate,
} from "../utils/emailTemplate.js";

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ================= SIGNUP ================= */
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "Email already exists" });

  const user = await User.create({ name, email, password });

  const token = user.generateToken("emailVerificationToken");
  await user.save({ validateBeforeSave: false });

  const link = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: verifyEmailTemplate(name, link),
  });

  res.status(201).json({
    message: "Verification email sent",
  });
};

/* ================= VERIFY EMAIL ================= */
export const verifyEmail = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;

  await user.save();

  res.json({ message: "Email verified successfully" });
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isEmailVerified)
    return res.status(403).json({ message: "Please verify your email first" });

  const token = createToken(user._id);

  user.password = undefined; // 🔐 hide password

  res.json({ token, user });
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  const token = user.generateToken("resetPasswordToken");
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset Password",
    html: resetPasswordTemplate(link),
  });

  res.json({ message: "Password reset email sent" });
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Token expired or invalid" });

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({ message: "Password updated successfully" });
};

/* ================= CHANGE PASSWORD ================= */
export const changePassword = async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.comparePassword(req.body.currentPassword)))
    return res.status(401).json({ message: "Wrong current password" });

  user.password = req.body.newPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
};
