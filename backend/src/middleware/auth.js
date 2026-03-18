import bcrypt from "bcryptjs";
import { verifyAccessToken } from "../lib/jwt.js";
import { User } from "../models/User.js";

export function getTokenFromRequest(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice("Bearer ".length);
  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "unauthorized" });
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ error: "unauthorized" });
    req.user = { id: String(user._id), email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return next();
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (user) req.user = { id: String(user._id), email: user.email, role: user.role, name: user.name };
    return next();
  } catch {
    return next();
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}

export async function hashToken(token) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}

export async function verifyTokenHash(token, hash) {
  if (!hash) return false;
  return bcrypt.compare(token, hash);
}

