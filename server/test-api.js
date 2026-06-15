/**
 * Тестирование всех маршрутов API бекенда Маршрутка v2.1
 * Запуск: node test-api.js
 * Предварительно: сервер должен быть запущен (npm start)
 */

const BASE = "http://localhost:4173";
let results = { passed: 0, failed: 0, errors: [] };
let adminToken = null;
let userToken = null;
let testUserId = null;

async function request(method, path, body = null, token = null) {
  const url = `${BASE}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, data: null, error: err.message };
  }
}

function test(name, fn) {
  return fn().then(success => {
    if (success) { console.log(`  ✅ ${name}`); results.passed++; }
    else { console.log(`  ❌ ${name}`); }
  }).catch(err => {
    console.log(`  ❌ ${name}: ${err.message}`);
    results.failed++;
    results.errors.push({ name, error: err.message });
  });
}

function assert(cond, msg) { if (!cond) throw new Error(msg || "Assertion failed"); return true; }

async function runTests() {
  console.log("\n==============================================");
  console.log("  ТЕСТИРОВАНИЕ API МАРШРУТКА v2.1");
  console.log("==============================================\n");

  // === 1. HEALTH ===
  console.log("\n--- 1. Health Check ---");
  await test("GET /api/health", async () => {
    const r = await request("GET", "/api/health");
    assert(r.ok && r.data.version === "2.1");
    return true;
  });

  // === 2. AUTH ===
  console.log("\n--- 2. Аутентификация ---");
  await test("POST /api/auth/register", async () => {
    const r = await request("POST", "/api/auth/register", { name: "Тест", email: `t${Date.now()}@t.ru`, password: "123456" });
    assert(r.status === 201 && r.data.accessToken);
    userToken = r.data.accessToken;
    testUserId = r.data.user.id;
    return true;
  });

  const freshEmail = `fresh${Date.now()}@t.ru`;
  let reg1 = await request("POST", "/api/auth/register", { name: "Fresh", email: freshEmail, password: "123456" });
  if (reg1.ok) { userToken = reg1.data.accessToken; testUserId = reg1.data.user.id; }

  await test("POST /api/auth/register (duplicate → 409)", async () => {
    const r = await request("POST", "/api/auth/register", { name: "Dup", email: freshEmail, password: "123456" });
    assert(r.status === 409);
    return true;
  });

  await test("POST /api/auth/login", async () => {
    const r = await request("POST", "/api/auth/login", { email: "admin@marshrutka.ru", password: "admin123" });
    assert(r.ok && r.data.accessToken && r.data.user.role === "admin");
    adminToken = r.data.accessToken;
    return true;
  });

  await test("POST /api/auth/login (wrong password → 401)", async () => {
    const r = await request("POST", "/api/auth/login", { email: freshEmail, password: "wrong" });
    assert(r.status === 401);
    return true;
  });

  // === 3. COMPANIES ===
  console.log("\n--- 3. Предприятия ---");
  await test("GET /api/companies", async () => {
    const r = await request("GET", "/api/companies");
    assert(r.ok && r.data.length === 6);
    return true;
  });

  await test("GET /api/companies/leps", async () => {
    const r = await request("GET", "/api/companies/leps");
    assert(r.ok && r.data.id === "leps");
    return true;
  });

  await test("GET /api/companies/mayak/tasks", async () => {
    const r = await request("GET", "/api/companies/mayak/tasks");
    assert(r.ok && r.data.tasks.length === 3);
    return true;
  });

  await test("GET /api/companies/leps/pieces?track=business", async () => {
    const r = await request("GET", "/api/companies/leps/pieces?track=business");
    assert(r.ok && r.data.length >= 2);
    return true;
  });

  await test("GET /api/companies/leps/pieces/0", async () => {
    const r = await request("GET", "/api/companies/leps/pieces/0");
    assert(r.ok && r.data.piece_index === 0);
    return true;
  });

  await test("GET /api/companies/nonexistent → 404", async () => {
    const r = await request("GET", "/api/companies/nonexistent");
    assert(r.status === 404);
    return true;
  });

  // === 4. QUESTIONS ===
  console.log("\n--- 4. Вопросы ---");
  await test("GET /api/questions", async () => {
    const r = await request("GET", "/api/questions");
    assert(r.ok && r.data.length === 7, `Expected 7, got ${r.data?.length}`);
    assert(r.data[0] && r.data[0].answers, "Missing answers field");
    assert(r.data[0].answers.length === 3, `Expected 3 answers, got ${r.data[0].answers?.length}`);
    return true;
  });

  // === 5. PROFILE ===
  console.log("\n--- 5. Профиль ---");
  await test("GET /api/profile", async () => {
    const r = await request("GET", "/api/profile", null, userToken);
    assert(r.ok && r.data.user && r.data.progress);
    return true;
  });

  await test("PUT /api/profile", async () => {
    const r = await request("PUT", "/api/profile", { name: "Обновлён", school: "Школа", region: "Регион" }, userToken);
    assert(r.ok && r.data.name === "Обновлён");
    return true;
  });

  await test("PUT /api/profile/avatar", async () => {
    const r = await request("PUT", "/api/profile/avatar", { skin: "#f6d0b1", hair: "#171717", suit: "#ff6f61" }, userToken);
    assert(r.ok && r.data.skin === "#f6d0b1");
    return true;
  });

  await test("GET /api/profile/achievements", async () => {
    const r = await request("GET", "/api/profile/achievements", null, userToken);
    assert(r.ok && Array.isArray(r.data));
    return true;
  });

  await test("GET /api/profile/progress", async () => {
    const r = await request("GET", "/api/profile/progress", null, userToken);
    assert(r.ok && r.data.progress);
    return true;
  });

  await test("POST /api/profile/tours", async () => {
    const r = await request("POST", "/api/profile/tours", { companyId: "leps", date: "2026-07-15", phone: "+7 900 123-45-67" }, userToken);
    assert(r.ok && r.data.company_id === "leps");
    return true;
  });

  await test("GET /api/profile/tours", async () => {
    const r = await request("GET", "/api/profile/tours", null, userToken);
    assert(r.ok && r.data.length >= 1);
    return true;
  });

  // === 6. CONFIG ===
  console.log("\n--- 6. Конфигурация ---");
  await test("GET /api/config/scoring", async () => {
    const r = await request("GET", "/api/config/scoring");
    assert(r.ok && r.data["1"] && r.data["2"] && r.data["3"]);
    return true;
  });

  await test("GET /api/config/levels", async () => {
    const r = await request("GET", "/api/config/levels");
    assert(r.ok && r.data.length === 4);
    return true;
  });

  await test("GET /api/config/game", async () => {
    const r = await request("GET", "/api/config/game");
    assert(r.ok && r.data.workers.length === 5 && r.data.docRows.length === 6);
    return true;
  });

  // === 7. STATISTICS ===
  console.log("\n--- 7. Статистика ---");
  await test("GET /api/statistics/global", async () => {
    const r = await request("GET", "/api/statistics/global");
    assert(r.ok && typeof r.data.totalUsers === "number");
    return true;
  });
  await test("GET /api/statistics/tracks", async () => {
    const r = await request("GET", "/api/statistics/tracks"); assert(r.ok); return true;
  });
  await test("GET /api/statistics/professions", async () => {
    const r = await request("GET", "/api/statistics/professions"); assert(r.ok); return true;
  });
  await test("GET /api/statistics/scores", async () => {
    const r = await request("GET", "/api/statistics/scores"); assert(r.ok); return true;
  });

  // === 8. FINAL RESULT ===
  console.log("\n--- 8. Финальные результаты ---");
  await test("GET /api/final-result?track=business", async () => {
    const r = await request("GET", "/api/final-result?track=business", null, userToken);
    assert(r.ok && r.data.track === "business");
    return true;
  });
  await test("GET /api/final-result?track=career", async () => {
    const r = await request("GET", "/api/final-result?track=career", null, userToken);
    assert(r.ok && r.data.track === "career");
    return true;
  });
  await test("GET /api/final-result (no track → 400)", async () => {
    const r = await request("GET", "/api/final-result", null, userToken);
    assert(r.status === 400);
    return true;
  });

  // === 9. PORTFOLIO ===
  console.log("\n--- 9. Портфолио ---");
  await test("GET /api/portfolio", async () => {
    const r = await request("GET", "/api/portfolio", null, userToken);
    assert(r.ok && r.data.user);
    return true;
  });

  // === 10. ADMIN ===
  console.log("\n--- 10. Admin API ---");
  await test("GET /api/admin/users (no token → 401)", async () => {
    const r = await request("GET", "/api/admin/users"); assert(r.status === 401); return true;
  });
  await test("GET /api/admin/users (user token → 403)", async () => {
    const r = await request("GET", "/api/admin/users", null, userToken); assert(r.status === 403); return true;
  });
  await test("GET /api/admin/users (admin token)", async () => {
    const r = await request("GET", "/api/admin/users", null, adminToken);
    assert(r.ok && r.data.users && r.data.total > 0);
    return true;
  });
  await test("GET /api/admin/users/:id", async () => {
    const r = await request("GET", `/api/admin/users/${testUserId}`, null, adminToken);
    assert(r.ok && r.data.user);
    return true;
  });
  await test("PUT /api/admin/users/:id", async () => {
    const r = await request("PUT", `/api/admin/users/${testUserId}`, { name: "EditedByAdmin" }, adminToken);
    assert(r.ok && r.data.name === "EditedByAdmin");
    return true;
  });
  await test("GET /api/admin/users/:id/export", async () => {
    const r = await request("GET", `/api/admin/users/${testUserId}/export`, null, adminToken);
    assert(r.ok && r.data.user);
    return true;
  });
  await test("GET /api/admin/companies", async () => {
    const r = await request("GET", "/api/admin/companies", null, adminToken);
    assert(r.ok && r.data.length === 6);
    return true;
  });
  await test("GET /api/admin/questions", async () => {
    const r = await request("GET", "/api/admin/questions", null, adminToken);
    assert(r.ok && r.data && r.data.length > 0);
    return true;
  });
  await test("POST /api/admin/questions", async () => {
    const r = await request("POST", "/api/admin/questions", { text: "Новый вопрос?", sort_order: 99 }, adminToken);
    assert(r.ok && r.data.text === "Новый вопрос?");
    return true;
  });
  await test("GET /api/admin/achievements", async () => {
    const r = await request("GET", "/api/admin/achievements", null, adminToken);
    assert(r.ok && r.data.length >= 13);
    return true;
  });
  await test("GET /api/admin/scoring-config", async () => {
    const r = await request("GET", "/api/admin/scoring-config", null, adminToken);
    assert(r.ok && r.data.length === 3);
    return true;
  });
  await test("GET /api/admin/level-thresholds", async () => {
    const r = await request("GET", "/api/admin/level-thresholds", null, adminToken);
    assert(r.ok && r.data.length === 4);
    return true;
  });
  await test("GET /api/admin/tasks", async () => {
    const r = await request("GET", "/api/admin/tasks", null, adminToken);
    assert(r.ok && r.data.length >= 9);
    return true;
  });
  await test("GET /api/admin/station-pieces", async () => {
    const r = await request("GET", "/api/admin/station-pieces", null, adminToken);
    assert(r.ok && r.data.length === 36);
    return true;
  });
  await test("GET /api/admin/final-results", async () => {
    const r = await request("GET", "/api/admin/final-results", null, adminToken);
    assert(r.ok && r.data.length === 2);
    return true;
  });
  await test("GET /api/admin/game-workers", async () => {
    const r = await request("GET", "/api/admin/game-workers", null, adminToken);
    assert(r.ok && r.data.length === 5);
    return true;
  });
  await test("GET /api/admin/game-doc-rows", async () => {
    const r = await request("GET", "/api/admin/game-doc-rows", null, adminToken);
    assert(r.ok && r.data.length === 6);
    return true;
  });

  // Admin exports
  await test("GET /api/admin/exports/users (CSV)", async () => {
    const r = await fetch(`${BASE}/api/admin/exports/users`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const text = await r.text();
    assert(r.ok, "CSV export failed with status " + r.status);
    assert(text.includes("id;name") || text.includes("name;email"), "CSV missing headers");
    return true;
  });
  await test("GET /api/admin/exports/progress (CSV)", async () => {
    const r = await fetch(`${BASE}/api/admin/exports/progress`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const text = await r.text();
    assert(r.ok && text.includes("user_id;name"));
    return true;
  });
  await test("GET /api/admin/exports/full (JSON)", async () => {
    const r = await request("GET", "/api/admin/exports/full", null, adminToken);
    assert(r.ok && r.data.users && r.data.companies);
    return true;
  });

  // === 11. TEACHER ===
  console.log("\n--- 11. Педагог ---");
  await test("GET /api/teacher/students (user → 403)", async () => {
    const r = await request("GET", "/api/teacher/students", null, userToken);
    assert(r.status === 403);
    return true;
  });
  await test("GET /api/teacher/students (admin)", async () => {
    const r = await request("GET", "/api/teacher/students", null, adminToken);
    assert(r.ok && Array.isArray(r.data));
    return true;
  });

  // === 12. UNAUTHORIZED ===
  console.log("\n--- 12. Защита ---");
  await test("GET /api/profile (no token → 401)", async () => {
    const r = await request("GET", "/api/profile"); assert(r.status === 401); return true;
  });
  await test("POST /api/auth/login (invalid → 400/429)", async () => {
    const r = await request("POST", "/api/auth/login", { email: "bad", password: "x" }); 
    assert(r.status === 400 || r.status === 429, `Expected 400 or 429, got ${r.status}`);
    return true;
  });

  // === RESULTS ===
  console.log("\n==============================================");
  console.log("  РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ");
  console.log("==============================================");
  console.log(`  Пройдено: ${results.passed}`);
  console.log(`  Провалено: ${results.failed}`);
  if (results.errors.length) {
    console.log("\n  Ошибки:");
    results.errors.forEach(e => console.log(`    - ${e.name}: ${e.error}`));
  }
  console.log("==============================================\n");
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error("\n❌", err.message); process.exit(1); });