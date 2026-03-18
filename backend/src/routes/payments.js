import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { getStripe } from "../lib/stripe.js";

export const paymentsRouter = express.Router();

const checkoutSchema = z.object({
  orderId: z.string().min(1),
});

paymentsRouter.post("/checkout", requireAuth, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const order = await Order.findOne({ _id: parsed.data.orderId, userId: req.user.id });
  if (!order) return res.status(404).json({ error: "not_found" });
  if (order.paymentStatus === "paid") return res.status(400).json({ error: "already_paid" });

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return res.status(400).json({ error: "stripe_not_configured" });
  }
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${clientUrl}/orders?success=1`,
    cancel_url: `${clientUrl}/cart?canceled=1`,
    line_items: order.items.map((it) => ({
      quantity: it.quantity,
      price_data: {
        currency: "eur",
        product_data: { name: it.name, images: it.image ? [it.image] : [] },
        unit_amount: Math.round(it.price * 100),
      },
    })),
    metadata: { orderId: String(order._id), userId: String(order.userId) },
  });

  order.stripeSessionId = session.id;
  await order.save();

  res.json({ url: session.url });
});

