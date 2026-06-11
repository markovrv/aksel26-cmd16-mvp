import express from "express";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import apiRouter from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientDist = join(__dirname, "..", "client", "dist");

const app = express();
app.use(express.json());

// API routes (v2.0 — заглушки)
app.use("/api", apiRouter);

// Статическая раздача React-билда
app.use(express.static(clientDist));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(join(clientDist, "index.html"));
});

const port = Number(process.env.PORT || 4173);
app.listen(port, "0.0.0.0", () => {
  console.log(`[Marshrutka v2.0] Server: http://localhost:${port}`);
});