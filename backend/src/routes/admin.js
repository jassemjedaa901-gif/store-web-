import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { seedProducts } from "../seed/products.js";

export const adminRouter = express.Router();

adminRouter.post("/reset-products", requireAuth, requireRole(["admin"]), async (_req, res) => {
  // Keep merchant/admin-added products intact.
  // Only ensure default seed products exist (matched by exact name).
  const existingNames = new Set(
    (await Product.find({}, { name: 1 }).lean()).map((p) => String(p.name || "").trim())
  );
  const missing = seedProducts.filter((p) => !existingNames.has(String(p.name || "").trim()));
  if (missing.length > 0) {
    await Product.insertMany(missing);
  }
  const total = await Product.countDocuments();
  res.json({ ok: true, added: missing.length, total });
});

