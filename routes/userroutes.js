import express from "express";
import { addToCart, getCart, getProfile, getWishlist, loginUser, removeFromCart, signupUser, toggleWishlist } from "../controllers/usercontroller.js";
import {protect} from "../middileware/isauthenticate.js";
import { getProductById } from "../controllers/productController.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login",loginUser);

// Protected route
router.get("/profile", protect, getProfile);

router.post("/wishlist/:productId", protect, toggleWishlist);
router.get("/wishlist", protect, getWishlist);

/* 🛒 CART */
router.post("/cart", protect, addToCart);
router.delete("/cart/:productId", protect, removeFromCart);
router.get("/cart", protect, getCart);


export default router;
