import { Router } from "express";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import companiesRouter from "./companies.js";
import tasksRouter from "./tasks.js";
import stationPiecesRouter from "./station-pieces.js";
import questionsRouter from "./questions.js";
import portfolioRouter from "./portfolio.js";
import teacherRouter from "./teacher.js";
import statisticsRouter from "./statistics.js";
import finalResultRouter from "./final-result.js";
import configRouter from "./config.js";
import adminRouter from "./admin/index.js";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "2.1" });
});

// Auth (/auth/*)
router.use("/auth", authRouter);

// Profile (/api/profile/*)
router.use("/profile", profileRouter);

// Companies (/api/companies/*)
router.use("/companies", companiesRouter);

// Tasks (/api/tasks/*)
router.use("/tasks", tasksRouter);

// Station Pieces (/api/station-pieces/*)
router.use("/station-pieces", stationPiecesRouter);

// Questions (/api/questions/*)
router.use("/questions", questionsRouter);

// Portfolio (/api/portfolio/*)
router.use("/portfolio", portfolioRouter);

// Teacher (/api/teacher/*)
router.use("/teacher", teacherRouter);

// Statistics (/api/statistics/*)
router.use("/statistics", statisticsRouter);

// Final Result (/api/final-result/*)
router.use("/final-result", finalResultRouter);

// Config (/api/config/*)
router.use("/config", configRouter);

// Admin (/api/admin/*)
router.use("/admin", adminRouter);

export default router;