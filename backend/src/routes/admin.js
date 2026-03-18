import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { seedProducts } from "../seed/products.js";

export const adminRouter = express.Router();

adminRouter.post("/reset-products", requireAuth, requireRole(["admin"]), async (_req, res) => {
  await Product.deleteMany({});
  await Product.insertMany(seedProducts);
  res.json({ ok: true, count: seedProducts.length });
});

