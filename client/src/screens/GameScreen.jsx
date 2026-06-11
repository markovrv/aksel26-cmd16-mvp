import { useState, useCallback, useEffect } from "react";
import { useGameState } from "../context/GameStateContext.jsx";
import useTimer from "../hooks/useTimer.js";
import { timeBonus, formatTime } from "../utils/scoring.js";

// ── Задачи ──
const FOREMAN_TASKS = [
  { id: 1, title: "Приёмка материалов", description: "По накладной пришло 520 шт кирпича вместо заказанных 500. Что будешь делать?", type: "choice", options: [{ text: "Принять (520 шт — в запас)", correct: true }, { text: "Отказать (не соответствует заказу)", correct: false }, { text: "Проверить ещё раз", correct: false }], maxScore: 10 },
  { id: 2, title: "Распределение бригад", description: "Распредели 5 рабочих в зоны Фундамент (2 чел) и Стены (3 чел): Пётр+Василий → фундамент; Николай+Ольга+Евгений → стены.", type: "dragdrop", maxScore: 15 },
  { id: 3, title: "Авария: закончились анкерные болты", description: "На площадке закончились анкерные болты. Работа стоит. Что предпримешь?", type: "choice", options: [{ text: "Отправить подсобника на склад", correct: true }, { text: "Ждать, пока само решится", correct: false }, { text: "Использовать обычные болты", correct: false }], maxScore: 20 },
];
const ENGINEER_TASKS = [
  { id: 1, title: "Снижение перегрузки ПС №2", description: "Подстанция №2 перегружена на 78%. Нужно переключить часть нагрузки.", type: "choice", options: [{ text: "Переключить 15% нагрузки на ПС №3", correct: true }, { text: "Оставить как есть", correct: false }, { text: "Отключить всех потребителей", correct: false }], maxScore: 10 },
  { id: 2, title: "Распределение резерва 50 МВт", description: "Выбери приоритетных потребителей для оставшихся 50 МВт.", type: "checkbox", options: [{ id: "factory", text: "Завод (35 МВт)", correct: false }, { id: "hospital", text: "Больница (10 МВт)", correct: true }, { id: "residential", text: "Жилой район (15 МВт)", correct: true }], maxScore: 15 },
  { id: 3, title: "Авария: обрыв ЛЭП", description: "Произошёл обрыв линии электропередачи. Часть потребителей отключена.", type: "choice", options: [{ text: "Отключить всё, пока чинят", correct: false }, { text: "Отключить хлебозавод, дать свет в дома и школу", correct: true }, { text: "Дать свет хлебозаводу, отключить дома", correct: false }], maxScore: 20 },
];
const INSPECTOR_TASKS = [
  { id: 1, title: "Осмотр стены", description: "Найди 3 скрытых дефекта на стене: трещину, широкий шов, вздутие.", type: "choice", options: [{ text: "Трещина в зоне A1, широкий шов B2, вздутие C3", correct: true }, { text: "Вздутие A1, трещина B3, узкий шов C1", correct: false }, { text: "Нет дефектов", correct: false }], maxScore: 10 },
  { id: 2, title: "Проверка документации", description: "Сравни акт бригады с нормативом СНиП. Найди 3 ошибки.", type: "checkbox", options: [{ id: "diam", text: "Диаметр арматуры: 10 мм вместо 12 мм", correct: true }, { id: "beton", text: "Марка бетона: М200 вместо М300", correct: true }, { id: "sign", text: "Подпись КК отсутствует", correct: true }, { id: "step", text: "Шаг армирования: 200 мм (верно)", correct: false }], maxScore: 15 },
  { id: 3, title: "Звонок заказчика", description: "Директор звонит и давит подписать акт приёмки раньше срока. Твои действия?", type: "choice", options: [{ text: "Подписать — директору виднее", correct: false }, { text: "Отказать — провести полную проверку", correct: true }, { text: "Подписать задним числом", correct: false }], maxScore: 20 },
];

function getTasks(profession) {
  if (profession === "foreman") return FOREMAN_TASKS;
  if (profession === "energy") return ENGINEER_TASKS;
  if (profession === "inspector") return INSPECTOR_TASKS;
  return [];
}

export default function GameScreen({ company, profession, navigateBack, showToast }) {
  const { state, dispatch } = useGameState();
  const tasks = getTasks(profession);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskResults, setTaskResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const timer = useTimer();

  useEffect(() => { timer.start(); console.log(`[Marshrutka] Game started: ${profession} on ${company.short}`); }, []);

  const handleChoiceAnswer = useCallback(() => {
    if (isProcessing || selectedOption === null) return;
    setIsProcessing(true);
    const task = tasks[currentTaskIdx];
    const timeMs = timer.stop();
    const correct = task.options[selectedOption]?.correct || false;
    const score = correct ? task.maxScore : 0;
    const bonus = correct ? timeBonus(task.id, timeMs) : 0;

    const result = { taskId: task.id, score: score + bonus, time: Math.floor(timeMs / 1000), correct };
    setTaskResults(prev => [...prev, result]);
    dispatch({ type: "SAVE_TASK_RESULT", payload: { companyId: company.id, ...result } });

    if (timeMs < 30000) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "quick_solver" });
    if (profession === "foreman" && task.id === 3 && correct) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "found_solution" });
    if (profession === "inspector" && task.id === 3 && correct) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "honest_inspector" });

    showToast(`${correct ? "Верно!" : "Ошибка"} +${score + bonus} баллов`);
    setTimeout(() => { setIsProcessing(false); setSelectedOption(null); if (currentTaskIdx < tasks.length - 1) { setCurrentTaskIdx(prev => prev + 1); timer.start(); } else finishGame(); }, 500);
  }, [isProcessing, selectedOption, currentTaskIdx, tasks, timer, dispatch, company.id, profession, showToast]);

  const handleCheckboxAnswer = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    const task = tasks[currentTaskIdx];
    const timeMs = timer.stop();
    const correctSet = new Set(task.options.filter(o => o.correct).map(o => o.id));
    const selectedSet = new Set(selectedCheckboxes);
    const allCorrect = correctSet.size === selectedSet.size && [...correctSet].every(id => selectedSet.has(id));
    const partlyCorrect = [...selectedSet].some(id => correctSet.has(id));
    const score = allCorrect ? task.maxScore : partlyCorrect ? Math.floor(task.maxScore / 2) : 0;
    const bonus = allCorrect ? timeBonus(task.id, timeMs) : 0;

    const result = { taskId: task.id, score: score + bonus, time: Math.floor(timeMs / 1000), correct: allCorrect };
    setTaskResults(prev => [...prev, result]);
    dispatch({ type: "SAVE_TASK_RESULT", payload: { companyId: company.id, ...result } });

    if (timeMs < 30000) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "quick_solver" });
    if (profession === "energy" && task.id === 2 && allCorrect) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "responsible" });

    showToast(`${allCorrect ? "Верно!" : "Частично"} +${score + bonus} баллов`);
    setTimeout(() => { setIsProcessing(false); setSelectedCheckboxes([]); if (currentTaskIdx < tasks.length - 1) { setCurrentTaskIdx(prev => prev + 1); timer.start(); } else finishGame(); }, 500);
  }, [isProcessing, selectedCheckboxes, currentTaskIdx, tasks, timer, dispatch, company.id, profession, showToast]);

  const finishGame = useCallback(() => {
    setShowResult(true);
    dispatch({ type: "SAVE_GAME_HISTORY", payload: { profession } });
    dispatch({ type: "COMPLETE_PIECE", payload: { companyId: company.id, pieceIndex: 3, choice: null } });
    const allResults = [...taskResults];
    if (allResults.length === 3 && allResults.every(r => r.correct)) {
      dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "perfectionist" });
    }
    console.log("[Marshrutka] Game finished:", { profession, results: allResults });
  }, [taskResults, dispatch, company.id, profession]);

  const currentTask = tasks[currentTaskIdx];
  const totalScore = taskResults.reduce((sum, r) => sum + r.score, 0);
  const maxPossible = 55;

  if (showResult) {
    return (
      <div className="screen active">
        <div className="results-screen">
          <h1 className="results-title">Результаты</h1>
          <div className="results-score"><span className="score-label">Ваш результат:</span><span className="score-value">{totalScore}</span><span className="score-max"> / {maxPossible}</span></div>
          <div className="results-skills"><h3>Оценённые навыки</h3>
            <div className="skill-row"><span className="skill-name">Организаторские способности</span><div className="skill-stars"><span className="star">⭐</span><span className="star">⭐</span><span className="star">⭐</span></div></div>
            <div className="skill-row"><span className="skill-name">Принятие решений</span><div className="skill-stars"><span className="star">⭐</span><span className="star">⭐</span><span className="star">⭐</span></div></div>
            <div className="skill-row"><span className="skill-name">Управление временем</span><div className="skill-stars"><span className="star">⭐</span><span className="star">⭐</span><span className="star">⭐</span></div></div>
          </div>
          <div className="results-time"><span>⏱️ Время прохождения: </span><span>{timer.formatted}</span></div>
          <div className="results-actions"><button className="button button-primary" onClick={navigateBack}>На карту станций →</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="game-fullscreen">
        <div className="hud-overlay">
          <div className="hud-top">
            <div className="hud-item"><span className="hud-icon">🎓</span><span>{state.profile?.name?.split(" ")[0] || "Игрок"}</span></div>
            <div className="hud-item"><span className="hud-icon">🏢</span><span>{company.short}</span></div>
            <div className="hud-item"><span className="hud-icon">⭐</span><span>{totalScore}</span>/{maxPossible}</div>
            <div className="hud-item"><span className="hud-icon">📋</span>Задача {currentTaskIdx + 1}/{tasks.length}</div>
            <div className="hud-item timer"><span className="hud-icon">⏱️</span><span>{timer.formatted}</span></div>
          </div>
        </div>

        <div className="progress-indicators">
          {tasks.map((t, i) => (
            <div key={i} className="progress-item"><div className={`progress-circle ${i < currentTaskIdx ? (taskResults[i]?.correct ? "done" : "wrong") : i === currentTaskIdx ? "active" : ""}`}></div><span>{i + 1}</span></div>
          ))}
        </div>

        <div style={{ padding: "80px 32px 32px", maxWidth: 600, margin: "0 auto" }}>
          <div className="task-box"><b>ЗАДАЧА {currentTask.id}/3</b><p>{currentTask.description}</p>
            {currentTask.type === "choice" && (
              <div className="options-list">{currentTask.options.map((opt, i) => (
                <button key={i} className={`option-item ${selectedOption === i ? "selected" : ""}`} onClick={() => setSelectedOption(i)} disabled={isProcessing}>{opt.text}</button>
              ))}</div>
            )}
            {currentTask.type === "checkbox" && (
              <div className="options-list">{currentTask.options.map(opt => (
                <label key={opt.id} className={`option-item ${selectedCheckboxes.includes(opt.id) ? "selected" : ""}`}>
                  <input type="checkbox" checked={selectedCheckboxes.includes(opt.id)} onChange={() => setSelectedCheckboxes(prev => prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id])} disabled={isProcessing} />{opt.text}
                </label>
              ))}</div>
            )}
            {currentTask.type === "dragdrop" && currentTask.workers && (
              <div>
                <div className="workers-container">{currentTask.workers.map(w => (<div key={w} className="worker-chip">{w}</div>))}</div>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>В демо-режиме назначение автоматическое.</p>
                <div className="zones-section">
                  {currentTask.zones.map(zone => (
                    <div key={zone.id} className="zone"><h4>{zone.name}</h4><p>Нужно: {zone.capacity} рабочих</p>
                      <div className="zone-drop-area">{zone.correct.map(w => (<div key={w} className="worker-chip" style={{ opacity: 0.5 }}>{w} (авто)</div>))}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button className="button button-ghost" onClick={navigateBack}>Выйти</button>
            {currentTask.type === "checkbox" ? (
              <button className="button button-primary" disabled={selectedCheckboxes.length === 0 || isProcessing} onClick={handleCheckboxAnswer}>Ответить</button>
            ) : (
              <button className="button button-primary" disabled={selectedOption === null || isProcessing} onClick={handleChoiceAnswer}>Ответить</button>
            )}
          </div>
          <div className="hint-box" style={{ position: "static", marginTop: 16 }}>
            <span>💡</span><span>Выберите правильный вариант.</span>
          </div>
        </div>
      </div>
    </div>
  );
}