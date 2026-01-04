import express from "express";
import { protect } from "../middileware/isauthenticate.js";
import adminOnly from "../middileware/adminMiddleware.js";
import { registerUser } from "../controllers/authcontroller.js";
import { createProduct } from "../controllers/productController.js";
import upload from "../middileware/uploadMiddleware.js";

const router = express.Router();

router.post("/register",protect, adminOnly , registerUser);
router.post(
  "/create",
  upload.single("image"), // field name must be "image"
  createProduct
);


export default router;
