import express from "express";

import { getAllProducts, getProductById } from "../controllers/productController.js";


const router = express.Router();

router.get("/",  getAllProducts);
router.get("/:id", getProductById);
router.get("/products/suggest", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  const results = await Product.find({
    name: { $regex: q, $options: "i" },
  })
    .select("name")
    .limit(6);

  res.json(results);
});


export default router;
