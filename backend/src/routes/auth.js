import express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { hashToken, requireAuth, verifyTokenHash } from "../middleware/auth.js";

export const authRouter = express.Router();

const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

function authResponse(user) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) return res.status(409).json({ error: "email_in_use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: "customer" });

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  res.json({ user: authResponse(user), accessToken, refreshToken });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const { email, password } = parsed.data;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: "invalid_credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  res.json({ user: authResponse(user), accessToken, refreshToken });
});

authRouter.post("/refresh", async (req, res) => {
  const token = req.body?.refreshToken;
  if (!token || typeof token !== "string") return res.status(400).json({ error: "invalid_input" });
  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "unauthorized" });
    const ok = await verifyTokenHash(token, user.refreshTokenHash);
    if (!ok) return res.status(401).json({ error: "unauthorized" });

    const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });
    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save();
    res.json({ accessToken, refreshToken });
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
});

authRouter.post("/logout", requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $set: { refreshTokenHash: null } });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

