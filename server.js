import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./routes/userroutes.js";
import productRoutes from "./routes/productRoute.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(  cors({
    origin: [
      "https://desvisa.onrender.com", // frontend
      "http://localhost:5173"        // local dev
    ],
    credentials: true
  })
);
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
