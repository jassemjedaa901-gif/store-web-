import express from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

export const ordersRouter = express.Router();

ordersRouter.get("/me", requireAuth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  const productIds = [
    ...new Set(
      orders.flatMap((o) => (o.items || []).map((it) => it.productId).filter(Boolean).map((id) => String(id)))
    ),
  ];
  if (productIds.length) {
    const products = await Product.find({ _id: { $in: productIds } }).select("image").lean();
    const imageById = new Map(products.map((p) => [String(p._id), p.image]));
    for (const o of orders) {
      for (const it of o.items || []) {
        const stored = it.image || "";
        const fromProduct = imageById.get(String(it.productId));
        const legacyPlaceholder = stored.includes("via.placeholder.com");
        const missing = !String(stored).trim();
        if (fromProduct && (legacyPlaceholder || missing)) {
          it.image = fromProduct;
        }
      }
    }
  }
  res.json({ orders });
});

ordersRouter.get("/", requireAuth, requireRole(["admin", "merchant"]), async (_req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  res.json({ orders });
});

const createSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  shipping: z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    phone: z.string().min(5).max(40),
    address: z.string().min(3).max(200),
    city: z.string().min(2).max(80),
    postalCode: z.string().min(2).max(20),
  }),
});

ordersRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const ids = parsed.data.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids }, active: true }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  let totalPrice = 0;
  const items = [];
  for (const it of parsed.data.items) {
    const p = byId.get(it.productId);
    if (!p) return res.status(400).json({ error: "invalid_product" });
    if (p.stock < it.quantity) return res.status(400).json({ error: "out_of_stock", productId: it.productId });
    totalPrice += p.price * it.quantity;
    items.push({
      productId: p._id,
      name: p.name,
      price: p.price,
      quantity: it.quantity,
      image: p.image,
    });
  }

  const order = await Order.create({
    userId: new mongoose.Types.ObjectId(req.user.id),
    items,
    totalPrice,
    shipping: parsed.data.shipping,
    status: "pending_payment",
    paymentStatus: "unpaid",
  });

  res.status(201).json({ order });
});

const statusSchema = z.object({
  status: z.enum(["pending_payment", "paid", "shipped", "cancelled"]),
});

ordersRouter.patch("/:id/status", requireAuth, requireRole(["admin", "merchant"]), async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const order = await Order.findByIdAndUpdate(req.params.id, { $set: { status: parsed.data.status } }, { new: true }).lean();
  if (!order) return res.status(404).json({ error: "not_found" });
  res.json({ order });
});

