import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { initDb } from "./db/connection.js";
import apiRouter from "./routes/api.js";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientDist = join(__dirname, "public");

async function main() {
  await initDb();
  console.log("[server] Database initialized.");

  const app = express();

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));

  // Body parsing
  app.use(express.json({ limit: "1mb" }));

  // API routes
  app.use("/api", apiRouter);

  // Static files + SPA fallback
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(join(clientDist, "index.html"), (err) => {
        if (err) next();
      });
    } else {
      next();
    }
  });

  // Error handler
  app.use(errorHandler);

  const port = Number(process.env.PORT || 15626);
  app.listen(port, "0.0.0.0", () => {
    console.log(`[Marshrutka v2.1] Server: http://localhost:${port}`);
    console.log(`[Marshrutka v2.1] API: http://localhost:${port}/api`);
  });
}

main().catch(err => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});