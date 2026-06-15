import { verifyToken } from "../utils/jwt.js";

export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Токен истёк", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Недействительный токен" });
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  const token = header.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId, role: decoded.role };
  } catch {
    req.user = null;
  }
  next();
}