import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Session from "../models/sessionmodel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

/* ================= UTIL ================= */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/* ================= PROFILE ================= */
export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/* ================= WISHLIST ================= */
export const toggleWishlist = async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  const exists = user.wishlist.some(
    (id) => id.toString() === productId
  );

  if (exists) {
    user.wishlist.pull(productId);
  } else {
    user.wishlist.addToSet(productId);
  }

  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
};

export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json({ success: true, wishlist: user.wishlist });
};

/* ================= CART ================= */
export const addToCart = async (req, res) => {
  const { productId, quantity = 1, size, color } = req.body;

  const user = await User.findById(req.user._id);

  const item = user.cart.find(
    (i) => i.product.toString() === productId
  );

  if (item) {
    item.quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity, size, color });
  }

  await user.save();
  res.json({ success: true, cart: user.cart });
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { cart: { product: productId } },
  });

  const user = await User.findById(req.user._id);
  res.json({ success: true, cart: user.cart });
};

export const getCart = async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product");
  res.json({ success: true, cart: user.cart });
};
