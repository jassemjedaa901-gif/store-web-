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

// 1. Connection DB (Optimized for Serverless)
connectDb(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/storeweb")
  .then(() => console.log(`MongoDB connected`))
  .catch(err => console.error("MongoDB connection error:", err));

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

// 🔑 الـ Router هذا يضمن إنو Express يفهم الـ prefix "/api"
const apiRouter = express.Router();

// IMPORTANT: Stripe webhook (Raw body needed)
apiRouter.use("/webhooks/stripe", stripeWebhookRouter);

apiRouter.use(express.json({ limit: "1mb" }));

apiRouter.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "store-web-backend", 
    db: mongoose.connection.readyState === 1 
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

// 2. Export for Vercel
export default app; 

// 3. Local Dev Only
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`API running locally on http://localhost:${port}`);
  });
}