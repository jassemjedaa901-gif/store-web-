import jwt from "jsonwebtoken";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, requireEnv("JWT_ACCESS_SECRET"), { expiresIn: "15m" });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, requireEnv("JWT_REFRESH_SECRET"), { expiresIn: "30d" });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, requireEnv("JWT_ACCESS_SECRET"));
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, requireEnv("JWT_REFRESH_SECRET"));
}

