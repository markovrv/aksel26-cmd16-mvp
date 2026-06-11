import { useGameState } from "../../context/GameStateContext.jsx";
import { trackTitle } from "../../utils/scoring.js";

export default function FinalResultModal({ onClose, navigate }) {
  const { state } = useGameState();
  const business = state.track === "business";

  return (
    <div className="modal-backdrop open" onClick={e => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>ФИНАЛ МАРШРУТА</small>
            <h2>{business ? "Идея твоего бизнес-проекта" : "Твоя карьерная траектория"}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="result-card">
          <h3>{business ? "«Цех.Сигнал»" : "Инженер по автоматизации"}</h3>
          <p>{business
            ? "Сервис предиктивного контроля оборудования для региональных производств: датчики собирают данные, а понятная панель заранее показывает риск простоя."
            : "Специалист, который проектирует, настраивает и улучшает автоматические производственные линии. Подходит твоему сочетанию аналитики и командности."}</p>
          <div className="result-tags">
            {business
              ? <><span>КЛИЕНТЫ: ЗАВОДЫ</span><span>ПРОТОТИП: ДАШБОРД</span><span>ПЕРВЫЙ ШАГ: 5 ИНТЕРВЬЮ</span></>
              : <><span>ОБУЧЕНИЕ: АВТОМАТИЗАЦИЯ</span><span>ПРАКТИКА: ПЛК + ЭЛЕКТРОНИКА</span><span>СТАРТ: СТАЖИРОВКА</span></>}
          </div>
        </div>
        <div className="fact-list">
          <div><b>01.</b> {business ? "Поговори с инженерами о самых дорогих простоях." : "Выбери программу колледжа или вуза по автоматизации."}</div>
          <div><b>02.</b> {business ? "Собери кликабельный прототип панели мониторинга." : "Собери учебный стенд на Arduino или ПЛК."}</div>
          <div><b>03.</b> {business ? "Проверь решение на одном типе оборудования." : "Подай заявку на экскурсию и стажировку."}</div>
        </div>
        <div className="modal-actions">
          <button className="button button-ghost" onClick={() => { onClose(); navigate("market"); }}>Открыть маркет</button>
          <button className="button button-primary" onClick={() => { onClose(); navigate("profile"); }}>В моё портфолио →</button>
        </div>
      </div>
    </div>
  );
}