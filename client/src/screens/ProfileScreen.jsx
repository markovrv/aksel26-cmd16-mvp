import { useGameState } from "../context/GameStateContext.jsx";
import { trackTitle } from "../utils/scoring.js";
import { exportPortfolioPDF } from "../utils/PDFExporter.js";
import Avatar3D from "../components/game/Avatar3D.jsx";

export default function ProfileScreen({ openModal, openFinalResult, navigate }) {
  const { state, companies, completedStationCount } = useGameState();

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

  return (
    <section className="screen active">
      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-avatar-stage" style={{ minHeight: 230, display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Avatar3D avatar={state.avatar} scale={1.05} />
          </div>
          <h2>{state.profile?.name || "Гость маршрута"}</h2>
          <p>{state.profile ? `${state.profile.category} · ${state.profile.email}` : "Создай профиль, чтобы начать"}</p>
          <div className="profile-level">
            <span>УРОВЕНЬ {state.level.toUpperCase()}</span>
            <i><b style={{ width: `${Math.min(100, state.score % 100)}%` }}></b></i>
          </div>
          <button className="button button-ghost full" onClick={() => openModal("avatar")}>Изменить аватар</button>
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