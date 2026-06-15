import jwt from "jsonwebtoken";
import { config } from "dotenv";

config({ path: new URL("../.env", import.meta.url).pathname });

const SECRET = process.env.JWT_SECRET || "fallback-dev-secret";

export function signAccessToken(payload) {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || "15m";
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function signRefreshToken(payload) {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || "30d";
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export function getRefreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}