import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import { connectDb } from "./lib/db.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { stripeWebhookRouter } from "./routes/stripe-webhook.js";
import { paymentsRouter } from "./routes/payments.js";
import { adminRouter } from "./routes/admin.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 240 }));

// Stripe webhook needs raw body
app.use("/webhooks/stripe", stripeWebhookRouter);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "store-web-backend" });
});

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/payments", paymentsRouter);
app.use("/admin", adminRouter);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

const port = Number(process.env.PORT || 4000);
await connectDb(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/storeweb");
// eslint-disable-next-line no-console
console.log(`MongoDB connected (${mongoose.connection.name})`);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}`);
});

