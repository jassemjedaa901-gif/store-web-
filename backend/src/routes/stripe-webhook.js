import express from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { getStripe } from "../lib/stripe.js";

export const stripeWebhookRouter = express.Router();

stripeWebhookRouter.post(
  "/",
  // Stripe envoie un payload JSON; on garde le body RAW pour la vérification de signature
  express.raw({ type: ["application/json", "application/*+json"] }),
  async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const isDev = process.env.NODE_ENV !== "production";
    const canVerifySignature = Boolean(webhookSecret) && !String(webhookSecret).includes("...");
    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      if (canVerifySignature) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else if (isDev) {
        // Dev fallback: accepte le webhook sans vérification de signature si la variable n'est pas configurée.
        // Utile pour PFE/local demo, mais NE PAS utiliser en production.
        // eslint-disable-next-line no-console
        console.warn("[stripe-webhook] STRIPE_WEBHOOK_SECRET manquant: bypass signature en dev.");
        const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
        event = JSON.parse(raw);
      } else {
        return res.status(500).send("missing webhook secret");
      }
    } catch (_err) {
      return res.status(400).send("invalid webhook payload or signature");
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

// Pour éviter "Cannot GET ..." quand on teste l'endpoint avec le navigateur.
stripeWebhookRouter.get("/", (_req, res) => {
  res.status(200).json({ ok: true, hint: "Stripe webhook endpoint: use POST /webhooks/stripe" });
});

