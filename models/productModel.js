import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Men",
        "Women",
        "Unisex",
        "Shoes",
        "Accessories",
        "Sportswear",
      ], // 🔥 category validation
    },
    supply: {
      type: Number,
      required: true,
      min: 0, // 🚫 no negative stock
    },

    // optional: image (future use)
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    }
);

export const Product = mongoose.model("Product", ProductSchema);