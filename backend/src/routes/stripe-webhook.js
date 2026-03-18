import express from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { getStripe } from "../lib/stripe.js";

export const stripeWebhookRouter = express.Router();

stripeWebhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(500).send("missing webhook secret");

    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).send("invalid signature");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== "paid") {
          const dbSession = await mongoose.startSession();
          try {
            await dbSession.withTransaction(async () => {
              // decrement stock (validate again)
              for (const it of order.items) {
                const p = await Product.findById(it.productId).session(dbSession);
                if (!p) throw new Error("product missing");
                if (p.stock < it.quantity) throw new Error("out of stock");
                p.stock -= it.quantity;
                await p.save({ session: dbSession });
              }

              order.paymentStatus = "paid";
              order.status = "paid";
              await order.save({ session: dbSession });
            });
          } finally {
            dbSession.endSession();
          }
        }
      }
    }

    res.json({ received: true });
  }
);

