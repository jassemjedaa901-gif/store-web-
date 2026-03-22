import express from "express";
import { z } from "zod";
import { Product } from "../models/Product.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";

export const productsRouter = express.Router();

productsRouter.get("/", optionalAuth, async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const all = req.query.all === "1";

  const filter = {};
  const canSeeAll = all && (req.user?.role === "admin" || req.user?.role === "merchant");
  if (!canSeeAll) filter.active = true;
  if (category && category !== "Tout") filter.category = category;
  if (search) filter.$text = { $search: search };

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ products });
});

productsRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product || product.active === false) return res.status(404).json({ error: "not_found" });
  res.json({ product });
});

const upsertSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  price: z.number().nonnegative(),
  image: z.string().min(1).max(2000),
  description: z.string().max(4000).optional().default(""),
  stock: z.number().int().nonnegative(),
  active: z.boolean().optional().default(true),
});

productsRouter.post("/", requireAuth, requireRole(["admin", "merchant"]), async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const product = await Product.create({ ...parsed.data, createdBy: req.user.id });
  res.status(201).json({ product });
});

productsRouter.put("/:id", requireAuth, requireRole(["admin", "merchant"]), async (req, res) => {
  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const product = await Product.findByIdAndUpdate(req.params.id, { $set: parsed.data }, { new: true }).lean();
  if (!product) return res.status(404).json({ error: "not_found" });
  res.json({ product });
});

productsRouter.delete("/:id", requireAuth, requireRole(["admin", "merchant"]), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $set: { active: false } }, { new: true }).lean();
  if (!product) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});