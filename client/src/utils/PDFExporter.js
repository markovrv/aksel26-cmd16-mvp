// Генератор портфолио через HTML + браузерную печать (PDF-принтер)
export function exportPortfolioPDF(state, companies) {
  const name = state.profile?.name || "Гость";
  const category = state.profile?.category || "—";
  const email = state.profile?.email || "—";
  const track = state.track === "business" ? "Технологический предприниматель"
    : state.track === "career" ? "Карьера в индустрии" : "Не определён";
  const date = new Date().toLocaleDateString("ru-RU");

  const skillLabels = {
    initiative: "Инициатива / предпринимательство",
    analytics: "Аналитика / экспертиза",
    team: "Командность / организация",
  };

  const stars = (val) =>
    val >= 80 ? "★★★★★" : val >= 60 ? "★★★★" : val >= 40 ? "★★★" : val >= 20 ? "★★" : "★";

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ── Сбор строк таблицы задач ──
  let taskRows = "";
  companies.forEach((c) => {
    const p = state.completed[c.id];
    if (p?.taskResults?.length) {
      p.taskResults.forEach((tr, idx) => {
        const bg = idx % 2 === 0 ? "#f0f0f0" : "#fff";
        taskRows += `<tr style="background:${bg}"><td>${c.short}</td><td>Задача ${tr.taskId}</td><td>${tr.score}</td><td>${fmtTime(tr.time || 0)}</td><td style="color:${tr.correct ? "#22C55E" : "#EF4444"}">${tr.correct ? "✓" : "✗"}</td></tr>`;
      });
    }
  });

  const achievementsList = state.achievements.length
    ? state.achievements.map((id) => `<li>${id}</li>`).join("")
    : "<li>Нет достижений</li>";

  const toursList = state.tours.length
    ? state.tours
        .map((t) => {
          const comp = companies.find((c) => c.id === t.companyId);
          return `<li>${comp?.short || t.companyId}: ${t.date}, ${t.phone}</li>`;
        })
        .join("")
    : "<li>Нет заявок</li>";

  const rec = state.track === "business"
    ? "Рекомендуем развивать предпринимательские навыки: пройти стажировку на предприятии, поучаствовать в хакатоне, собрать прототип продукта."
    : "Рекомендуем углублять профессиональную экспертизу: выбрать профильный вуз или колледж, пройти практику, собрать портфолио проектов.";

  const completedCount = companies.filter((c) => {
    const p = state.completed[c.id];
    return p?.pieces?.length === 4;
  }).length;

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Цифровое портфолио — Маршрутка</title>
<style>
  @page { size: A4; margin: 15mm; }
  body {
    font-family: Inter, Montserrat, Arial, Helvetica, sans-serif;
    font-size: 12px; color: #222; line-height: 1.45;
    max-width: 190mm; margin: 0 auto; padding: 15mm;
  }
  h1 { font-size: 22px; color: #536dfe; margin: 0 0 4px; }
  h2 { font-size: 16px; color: #536dfe; border-bottom: 2px solid #536dfe; padding-bottom: 4px; margin: 20px 0 10px; }
  .sub { color: #888; font-size: 11px; margin: 0 0 16px; }
  .header { background: #536dfe; color: #fff; padding: 18px 20px; margin: -15mm -15mm 20px; }
  .header h1 { color: #fff; margin: 0; }
  .header p { margin: 4px 0 0; opacity: 0.85; font-size: 12px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; margin-bottom: 20px; }
  .info-grid dt { font-weight: 600; color: #555; font-size: 10px; }
  .info-grid dd { margin: 0 0 8px; font-size: 13px; }
  .station-row { display: flex; justify-content: space-between; padding: 5px 8px; border-bottom: 1px solid #eee; }
  .station-row.done { font-weight: 600; }
  .station-sub { font-size: 10px; color: #888; margin-left: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #536dfe; color: #fff; padding: 6px 8px; font-size: 10px; text-align: left; }
  td { padding: 5px 8px; font-size: 11px; border-bottom: 1px solid #eee; }
  .skills { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .skill-card { background: #f5f7ff; border-radius: 8px; padding: 12px; text-align: center; }
  .skill-card .stars { color: #ffb300; font-size: 16px; }
  ul { margin: 4px 0 0; padding-left: 18px; }
  .footer { margin-top: 24px; text-align: center; color: #aaa; font-size: 10px; border-top: 1px solid #ddd; padding-top: 12px; }
</style>
</head>
<body>
<div class="header">
  <h1>ЦИФРОВОЕ ПОРТФОЛИО</h1>
  <p>Платформа «Маршрутка» — профориентационный симулятор</p>
</div>

<h2>Данные участника</h2>
<dl class="info-grid">
  <dt>Имя</dt><dd>${name}</dd>
  <dt>Дата</dt><dd>${date}</dd>
  <dt>Категория</dt><dd>${category}</dd>
  <dt>Трек</dt><dd>${track}</dd>
  <dt>Email</dt><dd>${email}</dd>
  <dt>Уровень · Баллы</dt><dd>${state.level} · ${state.score}</dd>
</dl>

<h2>Станции маршрута (${completedCount}/${companies.length})</h2>
${companies
  .map((c) => {
    const p = state.completed[c.id];
    const pieces = p?.pieces?.length || 0;
    const done = pieces === 4;
    return `<div class="station-row${done ? " done" : ""}">
      <span>${done ? "✓" : "○"} ${c.short}</span>
      <span>${pieces}/4 блоков</span>
    </div>${p?.taskResults?.length ? p.taskResults.map((tr) => `<div class="station-sub">Задача ${tr.taskId}: ${tr.score} баллов, ${fmtTime(tr.time || 0)} ${tr.correct ? "✓" : "✗"}</div>`).join("") : ""}`;
  })
  .join("")}

<h2>Оценённые навыки</h2>
<div class="skills">
  ${Object.entries(state.skills)
    .map(
      ([key, val]) =>
        `<div class="skill-card"><div>${skillLabels[key] || key}</div><div class="stars">${stars(val)}</div><div style="font-size:12px;font-weight:600">${val}%</div></div>`
    )
    .join("")}
</div>

${taskRows ? `<h2>Таблица задач</h2>
<table><thead><tr><th>Станция</th><th>Задача</th><th>Баллы</th><th>Время</th><th>Статус</th></tr></thead><tbody>${taskRows}</tbody></table>` : ""}

<h2>Достижения</h2>
<ul>${achievementsList}</ul>

<h2>Заявки на экскурсии</h2>
<ul>${toursList}</ul>

<h2>Рекомендация платформы</h2>
<p>${rec}</p>

<div class="footer">Создано платформой «Маршрутка» — профориентационный симулятор</div>

<script>
  window.onload = function() { window.print(); };
</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Разрешите всплывающие окна для печати портфолио.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  console.log("[Marshrutka] PDF export: print dialog opened");
}