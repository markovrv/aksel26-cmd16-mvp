import { Router } from "express";

const router = Router();

// v2.0 — заглушки API, возвращают HTTP 501 Not Implemented
// В v2.1 здесь будет полноценный REST API

router.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "2.0" });
});

// Профиль
router.get("/profile", (_req, res) => {
  res.status(501).json({ error: "Not Implemented — используйте localStorage в v2.0" });
});

// Предприятия
router.get("/companies", (_req, res) => {
  res.status(501).json({ error: "Not Implemented" });
});

router.get("/companies/:id/tasks", (_req, res) => {
  res.status(501).json({ error: "Not Implemented" });
});

// Решения задач
router.post("/tasks/:id/solve", (_req, res) => {
  res.status(501).json({ error: "Not Implemented" });
});

// Портфолио
router.get("/portfolio/:userId", (_req, res) => {
  res.status(501).json({ error: "Not Implemented — PDF генерируется на фронтенде" });
});

// Педагог
router.get("/teacher/students", (_req, res) => {
  res.status(501).json({ error: "Not Implemented — роль teacher в v2.1" });
});

// Статистика
router.get("/statistics/professions", (_req, res) => {
  res.status(501).json({ error: "Not Implemented" });
});

export default router;