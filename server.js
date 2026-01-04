import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./routes/userroutes.js";
import productRoutes from "./routes/productRoute.js";

dotenv.config();
connectDB();

const app = express();

/* =========================
   ✅ CORS CONFIG (FINAL)
========================= */
const allowedOrigins = [
  "https://www.desvisa.com",
  "https://desvisa.com",
  "https://desvisa.onrender.com",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests without origin (Postman, server-side)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// 🔥 VERY IMPORTANT (preflight support)
app.options("*", cors());

/* ========================= */

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Ekart Backend Running 🚀");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
