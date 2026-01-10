import express from "express";
import {
  createOrder,
  createRazorpayOrder,
  verifyPaymentAndConfirmOrder,
  createShiprocketOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  downloadInvoice,
} from "../controllers/orderController.js";

import protect from "../middleware/isauthenticate.js";

const router = express.Router();

/* ==============================
   ORDER CREATION
================================ */

// Create order in DB
router.post("/", protect, createOrder);

// Create Razorpay order
router.post("/razorpay", protect, createRazorpayOrder);

// Verify payment & update order
router.post("/verify-payment", protect, verifyPaymentAndConfirmOrder);

// Create Shiprocket shipment
router.post("/shiprocket", protect, createShiprocketOrder);

/* ==============================
   ORDER FETCHING
================================ */

// Get logged-in user's orders
router.get("/myorders", protect, getMyOrders);

router.put("/:id/cancel", protect, cancelOrder);
router.get("/:id/invoice", protect, downloadInvoice);


// Get order by ID
router.get("/:id", protect, getOrderById);

export default router;
