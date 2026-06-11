import { useGameState } from "../context/GameStateContext.jsx";
import { trackTitle } from "../utils/scoring.js";
import Avatar3D from "../components/game/Avatar3D.jsx";

export default function HomeScreen({ navigate, handleStart, companies }) {
  const { state, completedStationCount } = useGameState();

  const defaultAvatar = { skin: "#f0b38f", suit: "#536dfe", hair: "#37251c" };

  const completed = completedStationCount();
  const nextStation = (() => {
    for (let i = 0; i < companies.length; i++) {
      if (!state.completed[companies[i].id] || state.completed[companies[i].id].pieces.length < 4) {
        return companies[i];
      }
    }
    return null;
  })();

  return (
    <section className="screen active">
      <div className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot"></span> ПРОФОРИЕНТАЦИЯ НОВОГО УРОВНЯ</div>
          <h1>Найди свой путь<br /><span>в индустрии</span></h1>
          <p className="hero-lead">Пройди тест, собери аватар и исследуй предприятия. Твой маршрут закончится идеей бизнеса или понятным планом карьеры.</p>

          <div className="hero-actions">
            <button className="button button-primary" onClick={handleStart}>
              <span>{!state.profile ? "Создать профиль" : !state.track ? "Пройти диагностику" : "Продолжить маршрут"}</span>
              <span className="button-arrow">→</span>
            </button>
            <button className="button button-ghost" onClick={() => navigate("route")}>Смотреть карту</button>
          </div>

          <div className="hero-stats">
            <div><strong>06</strong><span>станций маршрута</span></div>
            <div><strong>24</strong><span>интерактивных блока</span></div>
            <div><strong>01</strong><span>персональный финал</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="radar">
            <div className="radar-ring ring-one"></div>
            <div className="radar-ring ring-two"></div>
            <div className="radar-ring ring-three"></div>
            <div className="radar-core" style={{ overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <Avatar3D avatar={state.avatar || defaultAvatar} scale={0.82} headOnly={true} />
            </div>
            <span className="orbit-dot dot-a"></span>
            <span className="orbit-dot dot-b"></span>
            <span className="orbit-dot dot-c"></span>
          </div>
          <div className="floating-card card-top">
            <small>ТВОЙ ТРЕК</small>
            <b>{state.track ? trackTitle(state.track) : "ЕЩЁ НЕ ОПРЕДЕЛЁН"}</b>
          </div>
          <div className="floating-card card-bottom">
            <small>СЛЕДУЮЩАЯ СТАНЦИЯ</small>
            <b>{nextStation ? nextStation.short : state.track ? "МАРШРУТ ЗАВЕРШЁН" : "ПРОЙДИ ДИАГНОСТИКУ"}</b>
          </div>
        </div>
      </div>

      <div className="ticker">
        <div className="ticker-track">
          <span>ТЕХНОЛОГИИ</span><i></i><span>ПРОИЗВОДСТВО</span><i></i><span>КАРЬЕРА</span><i></i><span>БИЗНЕС</span><i></i>
          <span>ТЕХНОЛОГИИ</span><i></i><span>ПРОИЗВОДСТВО</span><i></i><span>КАРЬЕРА</span><i></i><span>БИЗНЕС</span><i></i>
        </div>
      </div>

      <section className="section-wrap how-section">
        <div className="section-heading">
          <span>КАК ЭТО РАБОТАЕТ</span>
          <h2>Четыре шага до своего маршрута</h2>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <div className="step-index">01</div>
            <h3>Диагностика</h3>
            <p>Ответь на 7 вопросов. Алгоритм определит, где твои сильные стороны: в создании проектов или развитии внутри команды.</p>
          </article>
          <article className="step-card">
            <div className="step-index">02</div>
            <h3>Аватар</h3>
            <p>Собери цифрового героя: выбери образ, цвет и экипировку для прохождения промышленного маршрута.</p>
          </article>
          <article className="step-card">
            <div className="step-index">03</div>
            <h3>Предприятия</h3>
            <p>Открывай станции, изучай продукты и профессии, выполняй задания и накапливай энергию маршрута.</p>
          </article>
          <article className="step-card featured">
            <div className="step-index">04</div>
            <h3>Твой результат</h3>
            <p>Получи идею технологического проекта или карьерную карту с конкретными следующими шагами.</p>
          </article>
        </div>
      </section>

      <section className="section-wrap demo-route">
        <div className="section-heading split">
          <div>
            <span>КАРТА РЕГИОНА</span>
            <h2>Предприятия как игровые станции</h2>
          </div>
          <button className="text-link" onClick={() => navigate("route")}>Открыть весь маршрут →</button>
        </div>
        <div className="mini-route">
          {companies.map((c, i) => (
            <div className="mini-node" key={c.id}>
              <div className="mini-node-mark">{String(i + 1).padStart(2, "0")}</div>
              <b>{c.short}</b>
              <small>{c.type}</small>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}