import { useState, useEffect, useCallback } from "react";
import { useGameState } from "../context/GameStateContext.jsx";
import api from "../services/api.js";

export default function TeacherScreen({ openModal, showToast }) {
  const { state, companies } = useGameState();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classCodeFilter, setClassCodeFilter] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async (classCode) => {
    setLoading(true);
    try {
      const params = {};
      if (classCode || classCodeFilter) {
        params.classCode = (classCode || classCodeFilter).trim();
      }
      const data = await api.teacher.getStudents(params);
      setStudents(Array.isArray(data) ? data : (data.students || []));
    } catch (err) {
      console.warn("[Marshrutka] Failed to load students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const avgScore = students.length > 0
    ? students.reduce((sum, s) => sum + (s.score || 0), 0) / students.length
    : 0;

  // Station stats
  const stationStats = companies.map((c) => {
    let completed = 0;
    students.forEach((s) => {
      const idx = companies.findIndex((x) => x.id === c.id);
      if ((s.completedStations || 0) > idx) completed++;
    });
    return { company: c, completed, total: students.length };
  });

  const getProfile = (student) => {
    if (student.profile_json) {
      try {
        return typeof student.profile_json === "string"
          ? JSON.parse(student.profile_json)
          : student.profile_json;
      } catch { /* ignore */ }
    }
    return {};
  };

  const getSkills = (student) => {
    const profile = getProfile(student);
    return profile.skills || { initiative: 0, analytics: 0, team: 0 };
  };

  const getAchievements = (student) => {
    const profile = getProfile(student);
    return profile.achievements || [];
  };

  const getTours = (student) => {
    const profile = getProfile(student);
    return profile.tours || [];
  };

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
              {students.length}
            </div>
            <small style={{ fontSize: 11, color: "var(--muted)" }}>УЧЕНИКОВ</small>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--mint)", fontFamily: "Montserrat, sans-serif" }}>
              {Math.round(avgScore)}
            </div>
            <small style={{ fontSize: 11, color: "var(--muted)" }}>СРЕДНИЙ БАЛЛ</small>
          </div>
            <button className="button button-ghost compact" onClick={() => loadStudents()} disabled={loading}>
            {loading ? "..." : "⟳"}
          </button>
        </div>
      </div>

      {/* Фильтр по классу */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <input
          placeholder="Фильтр по классу (например, 7А-2026)"
          value={classCodeFilter}
          onChange={(e) => setClassCodeFilter(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--panel-2)",
            color: "var(--text)",
            fontSize: 14,
          }}
        />
        <button
          className="button button-primary compact"
          onClick={() => loadStudents()}
          disabled={loading}
          style={{ whiteSpace: "nowrap" }}
        >
          Применить
        </button>
        {classCodeFilter && (
          <button
            className="button button-ghost compact"
            onClick={() => {
              setClassCodeFilter("");
              loadStudents("");
            }}
            disabled={loading}
          >
            Сброс
          </button>
        )}
      </div>

      {/* Список учеников */}
      <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 20, marginBottom: 16 }}>
        Список учеников
      </h2>
      {loading ? (
        <p style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>Загрузка...</p>
      ) : students.length === 0 ? (
        <p style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
          Пока нет учеников. Попросите их зарегистрироваться, указав код класса.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {students.map((student, idx) => {
            const profile = getProfile(student);
            const skills = getSkills(student);
            const achievements = getAchievements(student);
            const tours = getTours(student);
            const trackLabel =
              student.track === "business"
                ? "Предприниматель"
                : student.track === "career"
                  ? "Специалист"
                  : "Не определён";
            const completedStations = student.completedStations || 0;
            const percent = Math.round((completedStations / companies.length) * 100);

            return (
              <div
                key={student.id || idx}
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
                    <div>
                      <strong style={{ fontSize: 16 }}>{student.name || profile.name || "Ученик"}</strong>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
                        {student.email || profile.email || ""}
                      </span>
                      <br />
                      <span style={{ fontSize: 11, color: "var(--muted)", opacity: 0.7 }}>
                        {student.school ? `🏫 ${student.school}` : ""}
                        {student.school && student.class_code ? " · " : ""}
                        {student.class_code ? `📚 ${student.class_code}` : ""}
                      </span>
                    </div>
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
                      {student.score || 0}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase" }}>
                      {student.level || "новичок"}
                    </span>
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
                    {completedStations}/{companies.length} станций
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
                      {Object.entries(skills).map(([key, val]) => (
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
                      {achievements.length > 0 ? (
                        achievements.map((a) => (
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
                    {tours.length > 0 ? (
                      <ul style={{ paddingLeft: 16 }}>
                        {tours.map((t, i) => {
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
      )}

      {/* Статистика по станциям */}
      <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 20, marginBottom: 16 }}>
        Статистика по предприятиям
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        {stationStats.map(({ company, completed, total }) => (
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
              {completed}/{total}
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
          Загрузите CSV-файл со списком учеников (ФИО, email, класс).
        </p>
        <button className="button button-ghost compact" onClick={() => showToast("Импорт CSV в разработке.")} disabled>
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
            if (students.length === 0) {
              showToast("Нет данных для экспорта.");
              return;
            }
            const printWindow = window.open("", "_blank", "width=900,height=700");
            if (!printWindow) {
              showToast("Разрешите всплывающие окна для экспорта.");
              return;
            }
            const rows = students
              .map(
                (s, i) =>
                  `<tr><td>${i + 1}</td><td>${s.name || "—"}</td><td>${s.score || 0}</td><td>${s.level || "новичок"}</td><td>${s.completedStations || 0}/${companies.length}</td><td>${s.track || "—"}</td></tr>`
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