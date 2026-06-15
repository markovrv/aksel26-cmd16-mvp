import { useState, useEffect } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import api from "../../services/api.js";

export default function StationPieceModal({ companyId, pieceIndex, onClose, onTourRequest, showToast }) {
  const { state, dispatch, companies, completedPieces } = useGameState();
  const company = companies.find(c => c.id === companyId);
  const index = companies.findIndex(c => c.id === companyId);
  const donePieces = completedPieces(companyId);
  const alreadyDone = donePieces.includes(pieceIndex);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pieceData, setPieceData] = useState(null);
  const [loadingPiece, setLoadingPiece] = useState(true);

  // Load piece content from API
  useEffect(() => {
    let cancelled = false;
    setLoadingPiece(true);
    api.companies.getPieces(companyId, { track: state.track })
      .then(pieces => {
        if (!cancelled && Array.isArray(pieces)) {
          const piece = pieces.find(p => p.piece_index === pieceIndex);
          if (piece) {
            setPieceData(piece);
          }
        }
      })
      .catch(err => {
        console.warn("[Marshrutka] Failed to load piece from API:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingPiece(false);
      });
    return () => { cancelled = true; };
  }, [companyId, pieceIndex, state.track]);

  if (!company) return null;

  // Parse piece content from API data or fallback to hardcoded
  const contents = pieceData ? {
    title: pieceData.title || "",
    visual: pieceData.visual || "",
    facts: pieceData.facts ? (typeof pieceData.facts === "string" ? JSON.parse(pieceData.facts) : pieceData.facts) : [],
    task: pieceData.task || "",
    options: pieceData.options ? (typeof pieceData.options === "string" ? JSON.parse(pieceData.options) : pieceData.options) : [],
  } : [
    {
      title: "История и масштаб",
      visual: `${company.short}: предприятие, которое влияет на развитие региона`,
      facts: [company.history, "Контент в демо создан как пример и будет заменён материалами команды проекта."],
      task: "Что важнее для устойчивого предприятия?",
      options: ["Связь опыта и новых технологий", "Только размер производства"]
    },
    {
      title: "Что здесь создают",
      visual: `Продукты предприятия «${company.short}»`,
      facts: company.products,
      task: state.track === "business" ? "Какой продукт можно усилить цифровым сервисом?" : "Какой продукт тебе интереснее изучить изнутри?",
      options: [company.products[0], company.products[1]]
    },
    {
      title: "Люди и профессии",
      visual: "Карьера начинается со знакомства с реальными задачами",
      facts: company.careers,
      task: "Какой навык особенно важен для этих профессий?",
      options: ["Умение учиться и работать в команде", "Умение избегать новых задач"]
    },
    {
      title: state.track === "business" ? "Твой бизнес-ход" : "Твой карьерный ход",
      visual: state.track === "business" ? "Найди точку роста для предприятия" : "Выбери роль на предприятии",
      facts: state.track === "business"
        ? [`Предложи сервис или продукт, который решает одну из задач производства.`, `Потенциальные партнёры: ${company.partners.join(", ")}.`]
        : [`Выбери профессиональную роль и первый шаг к ней.`, `Возможные партнёры обучения: ${company.partners.join(", ")}.`],
      task: "Как хочешь взаимодействовать с предприятием?",
      options: ["Как предприниматель-партнёр", "Как сотрудник команды"]
    }
  ][pieceIndex] || { title: "", visual: "", facts: [], task: "", options: [] };

  const handleComplete = async () => {
    if (!alreadyDone && selected === null) return;

    if (!alreadyDone) {
      setLoading(true);
      const choice = pieceIndex === 3 ? (selected === 0 ? "business" : "career") : null;

      dispatch({ type: "COMPLETE_PIECE", payload: { companyId, pieceIndex, choice } });

      try {
        await api.stationPieces.complete(companyId, pieceIndex, { choice });
        console.log(`[Marshrutka] Piece ${pieceIndex} for ${companyId} synced to server`);
      } catch (err) {
        console.warn("[Marshrutka] Failed to sync piece to server:", err);
      } finally {
        setLoading(false);
      }

      if (pieceIndex === 3 && companyId !== "final") {
        showToast(`+35 энергии. Станция пройдена.`);
        onClose();
        setTimeout(() => onTourRequest(companyId), 400);
        return;
      }
      if (pieceIndex === 3 && companyId === "final") {
        showToast("Маршрут завершён! Открой свой результат.");
        onClose();
        return;
      }
      showToast(`+20 энергии. Блок пройден.`);
    }
    onClose();
  };

  if (loadingPiece) {
    return (
      <div className="modal-backdrop open" onClick={e => e.target.classList.contains("modal-backdrop") && onClose()}>
        <div className="modal">
          <div className="modal-head">
            <div>
              <small>ЗАГРУЗКА</small>
              <h2>{company.short}</h2>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <p style={{ textAlign: "center", padding: "2rem", color: "#7b8497" }}>Загружаем содержимое...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop open" onClick={e => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>СТАНЦИЯ {String(index + 1).padStart(2, "0")} · БЛОК {pieceIndex + 1}/4</small>
            <h2>{contents.title}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="content-visual" style={{ background: `linear-gradient(to top, rgba(9,11,19,.94), transparent), linear-gradient(135deg, ${company.accent}, #191e2d)` }}>
          <b>{contents.visual}</b>
        </div>
        <div className="fact-list">
          {contents.facts.map((fact, i) => <div key={i}>{fact}</div>)}
        </div>
        <div className="task-box">
          <b>МИНИ-ЗАДАНИЕ</b>
          <p>{contents.task}</p>
          <div className="binary-options">
            {contents.options.map((opt, i) => (
              <button key={i} className={selected === i ? "selected" : ""}
                onClick={() => setSelected(i)}
                disabled={alreadyDone || loading}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="button button-primary" onClick={handleComplete}
            disabled={(!alreadyDone && selected === null) || loading}>
            {loading ? "Сохранение..." : alreadyDone ? "Посмотреть карту" : "Завершить блок +20"}
          </button>
        </div>
      </div>
    </div>
  );
}