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

// 1. Connection DB
connectDb(process.env.MONGO_URI)
  .then(() => console.log(`MongoDB connected successfully`))
  .catch(err => console.error("MongoDB connection error:", err));

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
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDb(process.env.MONGO_URI);
    }
  } catch (err) {
    console.error("DB Reconnect Error:", err);
  }

  res.json({ 
    ok: true, 
    service: "store-web-backend",
    db: mongoose.connection.readyState === 1 // السطر هذا هو اللي ناقصك!
  });
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