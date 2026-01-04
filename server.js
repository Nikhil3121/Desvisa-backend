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
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_ALT,
      "http://localhost:5173"
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
