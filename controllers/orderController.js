import Order from "../models/orderModel.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import axios from "axios";
import dotenv from "dotenv";
import  generateInvoice  from "../utils/generateInvoice.js";
dotenv.config();

/* ==============================
   RAZORPAY INSTANCE
================================ */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ==============================
   SHIPROCKET LOGIN
================================ */
const shiprocketLogin = async () => {
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );

  return response.data.token;
};

/* ==============================
   CREATE ORDER (DB ONLY)
================================ */
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: "CREATED",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   CREATE RAZORPAY ORDER
================================ */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    res.json(razorpayOrder);
  } catch (error) {
    res.status(500).json({ message: "Razorpay order failed" });
  }
};

/* ==============================
   VERIFY PAYMENT + UPDATE ORDER
================================ */
export const verifyPaymentAndConfirmOrder = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.orderStatus = "PAID";
    order.paymentResult = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "PAID",
    };

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   CREATE SHIPROCKET SHIPMENT
================================ */
export const createShiprocketOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order || !order.isPaid) {
      return res.status(400).json({ message: "Order not paid" });
    }

    const token = await shiprocketLogin();

    const shiprocketResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        order_id: order._id.toString(),
        order_date: new Date(),
        billing_customer_name: order.shippingAddress.name,
        billing_phone: order.shippingAddress.phone,
        billing_address: order.shippingAddress.address,
        billing_city: order.shippingAddress.city,
        billing_state: order.shippingAddress.state,
        billing_pincode: order.shippingAddress.pincode,
        billing_country: "India",
        payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
        sub_total: order.totalPrice,
        order_items: order.orderItems.map((item) => ({
          name: item.name,
          sku: item.productId.toString(),
          units: item.quantity,
          selling_price: item.price,
        })),
        length: 10,
        breadth: 10,
        height: 5,
        weight: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    order.shiprocket = {
      orderId: shiprocketResponse.data.order_id,
      shipmentId: shiprocketResponse.data.shipment_id,
      awbCode: shiprocketResponse.data.awb_code,
      courierName: shiprocketResponse.data.courier_name,
      status: "SHIPPED",
    };

    order.orderStatus = "SHIPPED";

    await order.save();

    res.json({
      success: true,
      shiprocket: shiprocketResponse.data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (["SHIPPED", "DELIVERED"].includes(order.orderStatus)) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled now" });
    }

    order.orderStatus = "CANCELLED";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const downloadInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  generateInvoice(res, order);
};

/* ==============================
   GET USER ORDERS
================================ */
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json(orders);
};

/* ==============================
   GET ORDER BY ID
================================ */
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};
