import { useState, useEffect, useCallback } from "react";
import { useGameState } from "../context/GameStateContext.jsx";
import { trackTitle } from "../utils/scoring.js";
import { exportPortfolioPDF } from "../utils/PDFExporter.js";
import Avatar3D from "../components/game/Avatar3D.jsx";
import api from "../services/api.js";

export default function ProfileScreen({ openModal, openFinalResult, navigate, showToast }) {
  const { state, dispatch, companies, completedStationCount } = useGameState();
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (api.isAuthenticated()) {
      setLoading(true);
      api.profile.get()
        .then(data => {
          setServerData(data);
          console.log("[Marshrutka] Profile loaded from server:", data);
        })
        .catch(err => console.warn("[Marshrutka] Failed to load profile from server:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  const completed = completedStationCount();
  const avatarStyle = {
    "--skin": state.avatar?.skin || "#f0b38f",
    "--suit": state.avatar?.suit || "#536dfe",
    "--hair": state.avatar?.hair || "#37251c"
  };

  const v1Achievements = [
    { code: "ID", name: "Участник", unlocked: !!state.profile },
    { code: "AI", name: "Трек найден", unlocked: !!state.track },
    { code: "3D", name: "Образ собран", unlocked: state.avatarCreated },
    { code: "01", name: "Первая станция", unlocked: completed >= 1 },
    { code: "03", name: "Экватор пути", unlocked: completed >= 3 },
    { code: "GO", name: "Финалист", unlocked: completed >= companies.length }
  ];

  const gameAchievements = [
    { code: "⚡", name: "Быстрый решатель", unlocked: state.achievements.includes("quick_solver") },
    { code: "💎", name: "Перфекционист", unlocked: state.achievements.includes("perfectionist") },
    { code: "🔧", name: "Нашёл решение", unlocked: state.achievements.includes("found_solution") },
    { code: "📊", name: "Ответственный диспетчер", unlocked: state.achievements.includes("responsible") },
    { code: "🔬", name: "Честный инспектор", unlocked: state.achievements.includes("honest_inspector") },
    { code: "🏆", name: "Мастер отрасли", unlocked: state.achievements.includes("master_builder") }
  ];

  const allAchievements = [...v1Achievements, ...gameAchievements];

  const getAction = () => {
    if (!state.profile) {
      return { text: "Создать профиль", action: () => openModal("registration") };
    }
    if (!state.track) {
      return { text: "Пройти диагностику", action: () => openModal("test") };
    }
    if (!state.avatarCreated) {
      return { text: "Создать аватар", action: () => openModal("avatar") };
    }
    if (completed === companies.length) {
      return { text: "Открыть итоговую карту", action: openFinalResult };
    }
    return { text: "Продолжить маршрут", action: () => navigate("route") };
  };

  const action = getAction();

  const getFinalDescription = () => {
    if (completed < companies.length) {
      return state.track === "business"
        ? "Твой профиль показывает склонность к запуску проектов. Проходи станции, чтобы собрать идею продукта для промышленности."
        : "Твой профиль показывает потенциал для профессионального роста в сильной команде. Проходи станции, чтобы собрать карьерную карту.";
    }
    return state.track === "business"
      ? "Итог маршрута: сервис предиктивного контроля оборудования для региональных производств. Начни с интервью с инженерами ЛЕПСЕ и прототипа панели мониторинга."
      : "Итог маршрута: инженер по автоматизации производства. Рекомендуемый путь — профильный колледж или вуз, учебные проекты по электронике и стажировка на предприятии.";
  };

  const handlePDF = () => {
    console.log("[Marshrutka] Exporting portfolio PDF...");
    exportPortfolioPDF(state, companies);
  };

  const handleLogout = () => {
    // Clear JWT tokens
    api.clearTokens();
    // Clear all localStorage (game state + any app data)
    localStorage.clear();
    // Clear all sessionStorage
    sessionStorage.clear();
    // Clear cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    // Reset context state to defaults
    dispatch({ type: "RESET_STATE" });
    // Navigate to home
    navigate("home");
    showToast("Выход выполнен. Все данные в браузере очищены.");
  };

  const handleResetProgress = useCallback(async () => {
    const confirmed = window.confirm(
      "Сбросить весь прогресс?\n\nБудут удалены:\n• Все баллы и результаты теста\n• Пройденные станции и блоки\n• Решённые задачи\n• Достижения и аватар\n• Заявки на экскурсии\n\nПрофиль пользователя останется. Вы сможете начать заново."
    );
    if (!confirmed) return;

    const token = api.getToken();
    console.log("[Marshrutka] Reset: token exists:", !!token);

    if (!token) {
      showToast("Токен не найден. Войдите заново.");
      return;
    }

    try {
      const res = await fetch("/api/profile/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      console.log("[Marshrutka] Reset: status", res.status);
      const data = await res.json().catch(() => null);
      console.log("[Marshrutka] Reset: data", data);
      if (!res.ok) {
        throw new Error(data?.error || "Сервер вернул ошибку");
      }
      // Clear local game state
      localStorage.removeItem("marshrutka-state");
      dispatch({ type: "RESET_STATE" });
      navigate("home");
      showToast("Прогресс полностью сброшен. Можете начать заново.");
    } catch (err) {
      console.error("[Marshrutka] Reset error:", err);
      showToast(err.message || "Ошибка при сбросе прогресса.");
    }
  }, [dispatch, navigate, showToast]);

  return (
    <section className="screen active">
      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-avatar-stage" style={{ minHeight: 230, display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Avatar3D avatar={state.avatar} scale={1.05} />
          </div>
          <h2>{state.profile?.name || "Гость маршрута"}</h2>
          <p>{state.profile ? `${state.profile.category} · ${state.profile.email}` : "Создай профиль, чтобы начать"}</p>
          {serverData?.user?.school && <p className="profile-school">{serverData.user.school}</p>}
          <div className="profile-level">
            <span>УРОВЕНЬ {state.level.toUpperCase()}</span>
            <i><b style={{ width: `${Math.min(100, state.score % 100)}%` }}></b></i>
          </div>
          <button className="button button-ghost full" onClick={() => openModal("avatar")}>Изменить аватар</button>
          <button className="button button-danger full" onClick={handleLogout} style={{ marginTop: 8 }}>
            Выход
          </button>
          <button
            className="button button-ghost full"
            onClick={handleResetProgress}
            style={{ marginTop: 4, fontSize: 12, color: "#ff6b6b" }}
          >
            Сбросить прогресс
          </button>
        </aside>

        <div className="profile-main">
          <div className="profile-hero">
            <small>ПЕРСОНАЛЬНЫЙ ТРЕК</small>
            <h1>{state.track ? trackTitle(state.track) : "Пока не определён"}</h1>
            <p>{getFinalDescription()}</p>
            <button className="button button-primary compact" onClick={action.action}>{action.text}</button>
          </div>

          <div className="profile-metrics">
            <article><small>БАЛЛЫ</small><strong>{state.score}</strong><span>энергии накоплено</span></article>
            <article><small>СТАНЦИИ</small><strong>{completed}/{companies.length}</strong><span>предприятий пройдено</span></article>
            <article><small>ЭКСКУРСИИ</small><strong>{state.tours.length}</strong><span>заявок отправлено</span></article>
          </div>

          <div className="portfolio-card">
            <div>
              <small>ЦИФРОВОЕ ПОРТФОЛИО</small>
              <h3>Твои достижения и итоговый маршрут</h3>
            </div>
            <div className="achievement-row" style={{ marginTop: 16, marginBottom: 16 }}>
              {allAchievements.map((item, i) => (
                <div key={i} className={`achievement ${item.unlocked ? "" : "locked"}`}>
                  <i>{item.code}</i><b>{item.name}</b>
                </div>
              ))}
            </div>
            <button className="button button-primary compact" onClick={handlePDF}>
              Скачать портфолио PDF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}