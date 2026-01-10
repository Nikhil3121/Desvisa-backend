import upload from "../middleware/uploadMiddleware.js";
import Product from "../models/productModel.js";


/* =========================
   GET ALL PRODUCTS (USER)
========================= */
export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = "latest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    /* ================= CATEGORY ================= */
    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    /* ================= SEARCH ================= */
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    /* ================= PRICE FILTER ================= */
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    /* ================= SORT ================= */
    let sortQuery = { createdAt: -1 };
    if (sort === "price_low") sortQuery = { price: 1 };
    if (sort === "price_high") sortQuery = { price: -1 };
    if (sort === "rating") sortQuery = { rating: -1 };

    /* ================= PAGINATION ================= */
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   GET PRODUCT BY ID (USER)
========================= */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

