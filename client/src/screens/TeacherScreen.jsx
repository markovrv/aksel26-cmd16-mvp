import { useState } from "react";
import { useGameState } from "../context/GameStateContext.jsx";

export default function TeacherScreen({ openModal, showToast }) {
  const { state, companies } = useGameState();
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Демо-ученики (имитация привязанных по коду класса)
  const demoStudents = [
    {
      id: "demo1",
      name: "Анна Петрова",
      email: "anna@student.ru",
      score: 245,
      level: "стажёр",
      track: "career",
      completedStations: 3,
      skills: { initiative: 45, analytics: 68, team: 52 },
      achievements: ["member", "track_found", "avatar_built", "first_station"],
      tours: [{ companyId: "leps", date: "2026-06-15", phone: "+7 900 111-22-33" }],
    },
    {
      id: "demo2",
      name: "Иван Смирнов",
      email: "ivan@student.ru",
      score: 410,
      level: "мастер",
      track: "business",
      completedStations: 5,
      skills: { initiative: 82, analytics: 55, team: 48 },
      achievements: ["member", "track_found", "avatar_built", "first_station", "equator", "quick_solver", "perfectionist"],
      tours: [],
    },
    {
      id: "demo3",
      name: "Ольга Кузнецова",
      email: "olga@student.ru",
      score: 85,
      level: "новичок",
      track: null,
      completedStations: 0,
      skills: { initiative: 30, analytics: 30, team: 30 },
      achievements: [],
      tours: [],
    },
  ];

  const currentStudent = state.profile || demoStudents[0];

  const getStationLabel = (company) => {
    return `${company.short} — ${company.type}`;
  };

  const stationStats = companies.map((c) => {
    let completed = 0;
    let total = 0;
    demoStudents.forEach((s) => {
      if (s.completedStations > 0) total++;
      // Упрощённо: считаем станцию пройденной если completedStations >= индекс+1
      if (s.completedStations > companies.findIndex((x) => x.id === c.id)) completed++;
    });
    return { company: c, completed, total };
  });

  const avgScore =
    demoStudents.reduce((sum, s) => sum + s.score, 0) / Math.max(1, demoStudents.length);

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <div className="eyebrow"><span className="live-dot"></span> КАБИНЕТ ПЕДАГОГА</div>
          <h1>Мои ученики</h1>
          <p>
            Код класса: <strong>{state.profile?.classCode || "7А-2026"}</strong> ·{" "}
            {state.profile?.school || "Школа №42"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--yellow)", fontFamily: "Montserrat, sans-serif" }}>
              {demoStudents.length}
            </div>
            <small style={{ fontSize: 11, color: "var(--muted)" }}>УЧЕНИКОВ</small>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--mint)", fontFamily: "Montserrat, sans-serif" }}>
              {Math.round(avgScore)}
            </div>
            <small style={{ fontSize: 11, color: "var(--muted)" }}>СРЕДНИЙ БАЛЛ</small>
          </div>
        </div>
      </div>

      {/* Список учеников */}
      <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 20, marginBottom: 16 }}>
        Список учеников
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {demoStudents.map((student, idx) => {
          const trackLabel =
            student.track === "business"
              ? "Предприниматель"
              : student.track === "career"
                ? "Специалист"
                : "Не определён";
          const percent = Math.round((student.completedStations / companies.length) * 100);

          return (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
              style={{
                background: "var(--panel)",
                border: `1px solid ${selectedStudent?.id === student.id ? "var(--blue)" : "var(--line)"}`,
                borderRadius: 14,
                padding: 16,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: 16 }}>{student.name}</strong>
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
                    {student.email}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: "var(--blue)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {trackLabel}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "var(--yellow)", fontFamily: "Montserrat, sans-serif" }}>
                    {student.score}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase" }}>{student.level}</span>
                </div>
              </div>

              {/* Прогресс-бар */}
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 6, background: "var(--line)", borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: "linear-gradient(to right, var(--blue), var(--yellow))",
                    }}
                  ></div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {student.completedStations}/{companies.length} станций
                </span>
              </div>

              {/* Детали (раскрываются) */}
              {selectedStudent?.id === student.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                  <h4 style={{ fontSize: 14, marginBottom: 8, fontFamily: "Montserrat, sans-serif" }}>
                    Детальный просмотр
                  </h4>

                  {/* Навыки */}
                  <h5 style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 4px" }}>НАВЫКИ</h5>
                  <div style={{ display: "flex", gap: 16 }}>
                    {Object.entries(student.skills).map(([key, val]) => (
                      <div key={key} style={{ flex: 1, textAlign: "center", background: "var(--panel-2)", borderRadius: 10, padding: 10 }}>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          {key === "initiative" ? "Инициатива" : key === "analytics" ? "Аналитика" : "Команда"}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--yellow)" }}>{val}%</div>
                      </div>
                    ))}
                  </div>

                  {/* Достижения */}
                  <h5 style={{ fontSize: 12, color: "var(--muted)", margin: "12px 0 4px" }}>ДОСТИЖЕНИЯ</h5>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {student.achievements.length > 0 ? (
                      student.achievements.map((a) => (
                        <span
                          key={a}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 16,
                            background: "rgba(92,225,185,.15)",
                            color: "var(--mint)",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {a}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Нет достижений</span>
                    )}
                  </div>

                  {/* Заявки на экскурсии */}
                  <h5 style={{ fontSize: 12, color: "var(--muted)", margin: "12px 0 4px" }}>ЭКСКУРСИИ</h5>
                  {student.tours.length > 0 ? (
                    <ul style={{ paddingLeft: 16 }}>
                      {student.tours.map((t, i) => {
                        const comp = companies.find((c) => c.id === t.companyId);
                        return (
                          <li key={i} style={{ fontSize: 12, color: "var(--muted)" }}>
                            {comp?.short || t.companyId}: {t.date}, {t.phone}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Нет заявок</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Статистика по станциям */}
      <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 20, marginBottom: 16 }}>
        Статистика по предприятиям
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        {stationStats.map(({ company, completed }) => (
          <div
            key={company.id}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
            }}
          >
            <h4 style={{ fontSize: 16, fontFamily: "Montserrat, sans-serif", marginBottom: 4 }}>
              {company.short}
            </h4>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>{company.type}</p>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--mint)", fontFamily: "Montserrat, sans-serif" }}>
              {completed}/{demoStudents.length}
            </div>
            <small style={{ fontSize: 11, color: "var(--muted)" }}>прошли</small>
          </div>
        ))}
      </div>

      {/* Загрузка CSV */}
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 16,
          marginBottom: 32,
        }}
      >
        <h3 style={{ fontSize: 16, fontFamily: "Montserrat, sans-serif", marginBottom: 8 }}>
          Импорт учеников (CSV)
        </h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
          Загрузите CSV-файл со списком учеников (ФИО, email, класс). В демо-режиме импорт не
          сохраняется.
        </p>
        <button className="button button-ghost compact" onClick={() => showToast("В демо-режиме импорт недоступен.")}>
          Загрузить CSV
        </button>
      </div>

      {/* Экспорт */}
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontFamily: "Montserrat, sans-serif", marginBottom: 8 }}>
          Выгрузка данных
        </h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
          Скачайте сводку по ученикам в формате PDF (браузерная печать).
        </p>
        <button
          className="button button-primary compact"
          onClick={() => {
            const printWindow = window.open("", "_blank", "width=900,height=700");
            if (!printWindow) {
              showToast("Разрешите всплывающие окна для экспорта.");
              return;
            }
            const rows = demoStudents
              .map(
                (s, i) =>
                  `<tr><td>${i + 1}</td><td>${s.name}</td><td>${s.score}</td><td>${s.level}</td><td>${s.completedStations}/${companies.length}</td><td>${s.track || "—"}</td></tr>`
              )
              .join("");
            const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Ведомость учеников</title><style>body{font-family:Montserrat,Arial,sans-serif;padding:20mm}h1{color:#536dfe}table{width:100%;border-collapse:collapse}th,td{padding:6px 10px;border:1px solid #ddd;font-size:12px}th{background:#536dfe;color:#fff}</style></head><body><h1>Ведомость учеников — ${state.profile?.classCode || "7А-2026"}</h1><table><thead><tr><th>№</th><th>ФИО</th><th>Баллы</th><th>Уровень</th><th>Станции</th><th>Трек</th></tr></thead><tbody>${rows}</tbody></table><p>${new Date().toLocaleDateString("ru-RU")}</p><script>window.onload=function(){window.print()}</script></body></html>`;
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
          }}
        >
          Выгрузить PDF-ведомость
        </button>
      </div>
    </section>
  );
}