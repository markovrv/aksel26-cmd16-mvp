import { Router } from "express";
import auth from "../../middleware/auth.js";
import admin from "../../middleware/admin.js";
import usersRouter from "./users.js";
import companiesRouter from "./companies.js";
import stationPiecesRouter from "./station-pieces.js";
import questionsRouter from "./questions.js";
import achievementsRouter from "./achievements.js";
import tasksRouter from "./tasks.js";
import finalResultsRouter from "./final-results.js";
import scoringConfigRouter from "./scoring-config.js";
import levelThresholdsRouter from "./level-thresholds.js";
import { workersRouter, docRowsRouter } from "./game-config.js";
import exportsRouter from "./exports.js";

const router = Router();

// All admin routes require JWT + admin role
router.use(auth);
router.use(admin);

router.use("/users", usersRouter);
router.use("/companies", companiesRouter);
router.use("/station-pieces", stationPiecesRouter);
router.use("/questions", questionsRouter);
router.use("/achievements", achievementsRouter);
router.use("/tasks", tasksRouter);
router.use("/final-results", finalResultsRouter);
router.use("/scoring-config", scoringConfigRouter);
router.use("/level-thresholds", levelThresholdsRouter);
router.use("/game-workers", workersRouter);
router.use("/game-doc-rows", docRowsRouter);
router.use("/exports", exportsRouter);

export default router;