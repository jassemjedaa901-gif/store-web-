import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import { connectDb } from "./lib/db.js";
import { seedIfEmpty } from "./lib/seed-if-empty.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { stripeWebhookRouter } from "./routes/stripe-webhook.js";
import { paymentsRouter } from "./routes/payments.js";
import { adminRouter } from "./routes/admin.js";

const app = express();

// 1. Connection DB (+ seed catalog if empty, dev only)
connectDb(process.env.MONGO_URI)
  .then(() => seedIfEmpty())
  .then(() => console.log(`MongoDB connected successfully`))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 240 }));

const apiRouter = express.Router();

// Stripe webhook
apiRouter.use("/webhooks/stripe", stripeWebhookRouter);

apiRouter.use(express.json({ limit: "1mb" }));

// ✅ الـ Health Check المصلح باش يطلعلك حالة الـ DB
apiRouter.get("/health", async (_req, res) => {
  let connectError = null;
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDb(process.env.MONGO_URI);
    }
  } catch (err) {
    connectError = err;
    console.error("DB Reconnect Error:", err);
  }

  const dbOk = mongoose.connection.readyState === 1;
  const mongoConfigured = Boolean(process.env.MONGO_URI);
  const payload = {
    ok: true,
    service: "store-web-backend",
    db: dbOk,
    mongoConfigured,
  };
  if (!dbOk && mongoConfigured) {
    payload.hint =
      "MongoDB refused the connection. On Atlas: Network Access allow 0.0.0.0/0 (or Vercel IPs), verify user/password, and check Vercel function logs for the full error.";
    if (connectError?.message) {
      payload.error = connectError.message;
    }
  }
  res.json(payload);
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/admin", adminRouter);

app.use("/api", apiRouter);

// Error Handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

// Export for Vercel
export default app;

// Local dev
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running locally on http://localhost:${port}`));
}