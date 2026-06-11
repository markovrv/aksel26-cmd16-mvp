import { useGameState } from "../context/GameStateContext.jsx";
import { trackTitle, trackShort } from "../utils/scoring.js";

const pieceLabels = ["История", "Продукты", "Профессии", "Твой выбор"];

// Стрелки 1→2→3→4→5→6 (по логическому порядку)
// Сетка 3×2: 0=ЛЕПСЕ, 1=1МАЯ, 2=ВМП (верх); 5=ФИНАЛ, 4=КЗЦМ, 3=БИОХИМ (низ)
const ARROWS = [
  { from: 0, to: 1, dir: "right" },   // ЛЕПСЕ → 1МАЯ
  { from: 1, to: 2, dir: "right" },   // 1МАЯ → ВМП
  { from: 2, to: 3, dir: "down" },    // ВМП ↓ БИОХИМ
  { from: 3, to: 4, dir: "left" },    // БИОХИМ ← КЗЦМ
  { from: 4, to: 5, dir: "left" },    // КЗЦМ ← ФИНАЛ
];

function Arrow({ dir }) {
  if (dir === "right") {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" style={{ position: "absolute", right: -32, top: "50%", transform: "translateY(-50%)", zIndex: 1, pointerEvents: "none" }}>
        <line x1="0" y1="12" x2="32" y2="12" stroke="#9ca4b8" strokeWidth="2" strokeDasharray="5 3" />
        <polygon points="32,12 24,6 24,18" fill="#9ca4b8" />
      </svg>
    );
  }
  if (dir === "left") {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" style={{ position: "absolute", left: -32, top: "50%", transform: "translateY(-50%)", zIndex: 1, pointerEvents: "none" }}>
        <line x1="40" y1="12" x2="8" y2="12" stroke="#9ca4b8" strokeWidth="2" strokeDasharray="5 3" />
        <polygon points="8,12 16,6 16,18" fill="#9ca4b8" />
      </svg>
    );
  }
  if (dir === "down") {
    return (
      <svg width="24" height="50" viewBox="0 0 24 50" style={{ position: "absolute", bottom: -42, left: "50%", transform: "translateX(-50%)", zIndex: 1, pointerEvents: "none" }}>
        <line x1="12" y1="0" x2="12" y2="36" stroke="#9ca4b8" strokeWidth="2" strokeDasharray="5 3" />
        <polygon points="12,36 6,28 18,28" fill="#9ca4b8" />
      </svg>
    );
  }
  return null;
}

export default function RouteScreen({ companies, openStationPiece, openModal, openTourForm, navigate }) {
  const { state, isStationUnlocked, stationComplete, completedPieces, completedStationCount, isInspectorUnlocked } = useGameState();

  const completed = completedStationCount();
  const percent = Math.round(completed / companies.length * 100);

  const skillMap = [
    ["Инициатива", state.skills.initiative],
    ["Аналитика", state.skills.analytics],
    ["Командность", state.skills.team]
  ];

  const getMission = () => {
    if (!state.profile) {
      return { title: "Создай профиль", text: "Укажи имя и категорию участника, чтобы сохранить прогресс.", button: "Создать профиль", action: () => openModal("registration") };
    }
    if (!state.track) {
      return { title: "Пройди диагностику", text: "7 коротких ситуаций определят персональный трек.", button: "Начать тест", action: () => openModal("test") };
    }
    if (!state.avatarCreated) {
      return { title: "Создай аватар", text: "Собери цифрового героя для маршрута.", button: "Создать аватар", action: () => openModal("avatar") };
    }
    const next = companies.find((c, i) => isStationUnlocked(i) && !stationComplete(c.id));
    if (next) {
      const nextPieces = completedPieces(next.id);
      return {
        title: `Открой станцию «${next.short}»`,
        text: "Пройди четыре части пазла и получи баллы.",
        button: "Продолжить",
        action: () => openStationPiece(next.id, nextPieces.length)
      };
    }
    return { title: "Маршрут завершён", text: "Твоя итоговая траектория уже собрана в профиле.", button: "Смотреть итог", action: () => navigate("profile") };
  };

  const mission = getMission();

  // КЗЦМ больше не требует прохождения Прораба и Энергетика — только последовательность станций
  const isKCCMBlocked = () => false;

  // Рендер одной станции
  const renderStation = (company, logicalIndex) => {
    const unlocked = isStationUnlocked(logicalIndex);
    const complete = stationComplete(company.id);
    const donePieces = completedPieces(company.id);
    const effectivelyLocked = !unlocked;

    return (
      <article key={company.id}
        className={`station ${effectivelyLocked ? "locked" : ""} ${complete ? "complete" : ""}`}
        style={{ "--station-accent": company.accent, position: "relative" }}>
        <div className="station-head">
          <div>
            <span className="station-number">СТАНЦИЯ {String(logicalIndex + 1).padStart(2, "0")}</span>
            <h3>{company.short}</h3>
          </div>
          <span className="station-type">{company.type}</span>
        </div>
        <div className="puzzle-grid">
          {pieceLabels.map((label, pieceIndex) => {
            const done = donePieces.includes(pieceIndex);
            const pieceUnlocked = unlocked && (pieceIndex === 0 || donePieces.includes(pieceIndex - 1) || done);
            const pieceDisabled = !pieceUnlocked;
            return (
              <button key={pieceIndex} className={`puzzle-piece ${done ? "done" : ""}`}
                onClick={() => openStationPiece(company.id, pieceIndex)}
                disabled={pieceDisabled}>
                <span className="piece-icon">{done ? "OK" : `0${pieceIndex + 1}`}</span>
                <span className="piece-label">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="station-footer">
          <span>
            {effectivelyLocked ? "ЗАБЛОКИРОВАНО" :
             complete ? "СТАНЦИЯ ПРОЙДЕНА" : "ДОСТУПНО СЕЙЧАС"}
          </span>
          <b>{donePieces.length}/4</b>
        </div>

        {/* Стрелка к следующей станции (по логическому порядку) */}
        {logicalIndex < companies.length - 1 && (
          <Arrow dir={ARROWS.find(a => a.from === logicalIndex)?.dir} />
        )}
      </article>
    );
  };

  // Визуальный порядок в сетке 3×2: верхний ряд 0-1-2, нижний 5-4-3
  // Логический путь: 0→1→2↓3←4←5 (стрелки рисуются по логическому порядку)
  const gridOrder = [0, 1, 2, 5, 4, 3];

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <div className="eyebrow"><span className="live-dot"></span> МАРШРУТ АКТИВЕН</div>
          <h1>Карта предприятий</h1>
          <p>Каждая станция состоит из четырёх частей. Пройди их по порядку, чтобы открыть следующую.</p>
        </div>
        <div className="route-summary">
          <div className="progress-ring" id="progressRing">
            <span>{percent}%</span>
          </div>
          <div>
            <small>ОБЩИЙ ПРОГРЕСС</small>
            <strong>{completed} из {companies.length} станций</strong>
          </div>
        </div>
      </div>

      <div className="route-layout">
        <aside className="mission-panel">
          <small>ТЕКУЩАЯ МИССИЯ</small>
          <h3>{mission.title}</h3>
          <p>{mission.text}</p>
          <button className="button button-primary compact" onClick={mission.action}>{mission.button}</button>
          <div className="mission-divider"></div>
          <small>ТВОЙ ТРЕК</small>
          <div className="track-badge">{state.track ? trackShort(state.track) : "Не определён"}</div>
          <small>НАВЫКИ</small>
          <div className="skill-bars">
            {skillMap.map(([label, value]) => (
              <div key={label}><span>{label}</span><i><b style={{ width: `${Math.min(100, value)}%` }}></b></i></div>
            ))}
          </div>
        </aside>

        <div className="route-map-wrap" style={{ overflowX: "visible" }}>
          <div className="route-map route-map-grid">
            {gridOrder.map(idx => renderStation(companies[idx], idx))}
          </div>
        </div>
      </div>
    </section>
  );
}