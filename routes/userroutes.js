import express from "express";
import protect from "../middleware/isauthenticate.js";

import {
  getProfile,
  toggleWishlist,
  getWishlist,
  addToCart,
  removeFromCart,
  getCart,
} from "../controllers/usercontroller.js"; // ✅ FIXED NAME

const router = express.Router();


/* ================= PROFILE ================= */
router.get("/profile", protect, getProfile);

/* ================= WISHLIST ================= */
router.post("/wishlist/:productId", protect, toggleWishlist);
router.get("/wishlist", protect, getWishlist);

/* ================= CART ================= */
router.post("/cart", protect, addToCart);
router.delete("/cart/:productId", protect, removeFromCart);
router.get("/cart", protect, getCart);

export default router;
