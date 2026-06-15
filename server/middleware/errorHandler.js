export default function errorHandler(err, _req, res, _next) {
  console.error("[error]", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Внутренняя ошибка сервера",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}