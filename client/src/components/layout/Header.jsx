import { useGameState } from "../../context/GameStateContext.jsx";
import { trackTitle } from "../../utils/scoring.js";
import api from "../../services/api.js";

export default function Header({ screen, navigate, handleStart, openAvatar, openTeacherLogin, openAdminLogin, showToast }) {
  const { state, dispatch, completedStationCount } = useGameState();

  const avatarStyle = {
    "--skin": state.avatar?.skin || "#f0b38f",
    "--suit": state.avatar?.suit || "#536dfe",
    "--hair": state.avatar?.hair || "#37251c"
  };

  const playerName = state.profile?.name?.split(" ")[0] || "Гость";

  return (
    <header className="topbar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); navigate("home"); }}>
        <span className="brand-mark"><span className="brand-mouth"></span></span>
        <span>
          <b>МАРШРУТКА</b>
          <small>ПРОМЫШЛЕННЫЙ КВЕСТ</small>
        </span>
      </a>

      <nav className="main-nav">
        <button className={`nav-link ${screen === "home" ? "active" : ""}`} onClick={() => navigate("home")}>Главная</button>
        <button className={`nav-link ${screen === "route" ? "active" : ""}`} onClick={() => navigate("route")}>Маршрут</button>
        <button className={`nav-link ${screen === "market" ? "active" : ""}`} onClick={() => navigate("market")}>Маркет</button>
        <button className={`nav-link ${screen === "profile" ? "active" : ""}`} onClick={() => navigate("profile")}>Профиль</button>
        {state.role === "admin" && (
          <button className={`nav-link ${screen === "admin" ? "active" : ""}`} onClick={() => navigate("admin")}>Админ</button>
        )}
      </nav>

      <div className="status-panel">
        <div className="score-chip" title="Накопленные баллы">
          <span className="coin"></span>
          <strong>{state.score}</strong>
        </div>
        <button className="avatar-chip" onClick={() => navigate("profile")}>
          <span className="mini-avatar" style={avatarStyle}></span>
          <span>{playerName}</span>
        </button>
        {state.role !== "teacher" && state.role !== "admin" && (
          <>
            <button className="button button-ghost compact" onClick={openTeacherLogin} style={{ fontSize: 11 }}>
              🔑 Педагогу
            </button>
            <button className="button button-ghost compact" onClick={openAdminLogin} style={{ fontSize: 11 }}>
              ⚙️ Админ
            </button>
          </>
        )}
        {(state.role === "teacher" || state.role === "admin") && (
          <button className="button button-ghost compact" onClick={() => {
            api.clearTokens();
            dispatch({ type: "SET_ROLE", payload: "student" });
            navigate("home");
            showToast("Выход из кабинета.");
          }} style={{ fontSize: 11 }}>
            Выйти
          </button>
        )}
      </div>
    </header>
  );
}