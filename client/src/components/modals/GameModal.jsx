import { useState, useCallback, useEffect, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useGameState } from "../../context/GameStateContext.jsx";
import useTimer from "../../hooks/useTimer.js";
import { timeBonus } from "../../utils/scoring.js";
import ConstructionSiteR3F from "../../game/scenes/ConstructionSiteR3F.jsx";
import DispatchRoomR3F from "../../game/scenes/DispatchRoomR3F.jsx";
import InspectionSiteR3F from "../../game/scenes/InspectionSiteR3F.jsx";

const hasWebGL = (() => {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
  catch { return false; }
})();

const ALL_WORKERS = [
  { id: 0, name: "Пётр", role: "каменщик", color: "#3366cc" },
  { id: 1, name: "Василий", role: "подсобник", color: "#33aa55" },
  { id: 2, name: "Николай", role: "каменщик", color: "#3366cc" },
  { id: 3, name: "Ольга", role: "сварщик", color: "#8844aa" },
  { id: 4, name: "Евгений", role: "водитель", color: "#cc6633" },
];
const CORRECT_FOUNDATION = [0, 1];
const CORRECT_WALLS = [2, 3, 4];

function DragDropPanel({ onComplete, onCancel }) {
  const [availableWorkers, setAvailableWorkers] = useState([...ALL_WORKERS]);
  const [foundation, setFoundation] = useState([]);
  const [walls, setWalls] = useState([]);
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = (e, worker) => { e.dataTransfer.setData("application/worker", JSON.stringify(worker)); e.dataTransfer.effectAllowed = "move"; };
  const handleDrop = (zone) => (e) => {
    e.preventDefault(); setDragOver(null);
    try {
      const worker = JSON.parse(e.dataTransfer.getData("application/worker"));
      setAvailableWorkers(prev => prev.filter(w => w.id !== worker.id));
      setFoundation(prev => prev.filter(w => w.id !== worker.id));
      setWalls(prev => prev.filter(w => w.id !== worker.id));
      if (zone === "foundation") setFoundation(prev => [...prev, worker]);
      else setWalls(prev => [...prev, worker]);
    } catch { }
  };
  const handleDragOver = (zone) => (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(zone); };
  const handleDragLeave = () => setDragOver(null);
  const returnToAvailable = (worker, fromZone) => {
    if (fromZone === "foundation") setFoundation(prev => prev.filter(w => w.id !== worker.id));
    if (fromZone === "walls") setWalls(prev => prev.filter(w => w.id !== worker.id));
    setAvailableWorkers(prev => [...prev, worker]);
  };
  const checkAnswer = () => {
    const fIds = foundation.map(w => w.id), wIds = walls.map(w => w.id);
    const fOk = fIds.length === 2 && CORRECT_FOUNDATION.every(id => fIds.includes(id));
    const wOk = wIds.length === 3 && CORRECT_WALLS.every(id => wIds.includes(id));
    let errors = 0; if (!fOk) errors++; if (!wOk) errors++;
    let score = 0, message = "";
    if (errors === 0) { score = 15; message = "✅ +15 баллов! Идеальное распределение!"; }
    else if (errors === 1) { score = 7; message = "⚠️ +7 баллов. Почти правильно."; }
    else { score = 0; message = "❌ Фундамент: Пётр+Василий, Стены: Николай+Ольга+Евгений"; }
    onComplete(score, errors === 0, message, fIds, wIds);
  };

  return (
    <div style={{ pointerEvents: "auto", maxWidth: 700, margin: "0 auto", padding: "0 16px" }}>
      <div style={{ background: "rgba(20,24,37,.97)", borderRadius: 14, border: "1px solid var(--line)", padding: 20, marginBottom: 12 }}>
        <h4 style={{ marginBottom: 12, fontSize: 14, color: "var(--muted)" }}>👷 Рабочие (перетащите в зоны)</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, minHeight: 52 }}>
          {availableWorkers.map(w => (
            <div key={w.id} draggable onDragStart={(e) => handleDragStart(e, w)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid var(--line)", cursor: "grab", userSelect: "none", fontWeight: 600, fontSize: 13 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: w.color, display: "inline-block", flexShrink: 0 }}></span>
              <span>{w.name}</span><span style={{ fontSize: 11, color: "var(--muted)" }}>{w.role}</span>
            </div>
          ))}
          {availableWorkers.length === 0 && <span style={{ color: "var(--muted)", fontSize: 12 }}>Все рабочие распределены</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div onDrop={handleDrop("foundation")} onDragOver={handleDragOver("foundation")} onDragLeave={handleDragLeave}
            style={{ padding: 14, borderRadius: 12, border: `2px dashed ${dragOver === "foundation" ? "var(--mint)" : "var(--line)"}`, background: dragOver === "foundation" ? "rgba(92,225,185,.08)" : "rgba(255,255,255,0.02)", minHeight: 80, transition: "all 0.15s" }}>
            <h4 style={{ fontSize: 14, marginBottom: 4 }}>🏗️ Фундамент</h4>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Нужно: 2 чел</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {foundation.map(w => (
                <div key={w.id} onClick={() => returnToAvailable(w, "foundation")} draggable onDragStart={(e) => handleDragStart(e, w)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, background: "rgba(92,225,185,.15)", border: "1px solid var(--mint)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: w.color, flexShrink: 0 }}></span>{w.name}
                </div>
              ))}
            </div>
          </div>
          <div onDrop={handleDrop("walls")} onDragOver={handleDragOver("walls")} onDragLeave={handleDragLeave}
            style={{ padding: 14, borderRadius: 12, border: `2px dashed ${dragOver === "walls" ? "var(--blue)" : "var(--line)"}`, background: dragOver === "walls" ? "rgba(83,109,254,.08)" : "rgba(255,255,255,0.02)", minHeight: 80, transition: "all 0.15s" }}>
            <h4 style={{ fontSize: 14, marginBottom: 4 }}>🧱 Стены</h4>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Нужно: 3 чел</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {walls.map(w => (
                <div key={w.id} onClick={() => returnToAvailable(w, "walls")} draggable onDragStart={(e) => handleDragStart(e, w)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, background: "rgba(83,109,254,.15)", border: "1px solid var(--blue)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: w.color, flexShrink: 0 }}></span>{w.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="button button-ghost compact" onClick={onCancel}>Отмена</button>
        <button className="button button-primary compact" onClick={checkAnswer} disabled={foundation.length + walls.length < 5}>Готово ✓</button>
      </div>
    </div>
  );
}

function getTasks(profession) {
  if (profession === "foreman") return [
    { id: 1, title: "Приёмка материалов", description: "По накладной пришло 520 шт кирпича вместо заказанных 500. Что будешь делать?", type: "invoice", maxScore: 10 },
    { id: 2, title: "Распределение бригад", description: "Перетащите рабочих в нужные зоны строительства", type: "dragdrop", maxScore: 15 },
    { id: 3, title: "Авария: закончились анкерные болты", description: "На площадке закончились анкерные болты. Работа стоит.", type: "choice", options: [{ text: "Отправить подсобника на склад", correct: true }, { text: "Ждать, пока само решится", correct: false }, { text: "Использовать обычные болты", correct: false }], maxScore: 20, emergency: true },
  ];
  if (profession === "energy") return [
    { id: 1, title: "Снижение перегрузки ПС №2", description: "Подстанция №2 перегружена на 78%. Нужно переключить часть нагрузки.", type: "choice", options: [{ text: "Переключить 15% нагрузки на ПС №3", correct: true }, { text: "Оставить как есть", correct: false }, { text: "Отключить всех потребителей", correct: false }], maxScore: 10 },
    { id: 2, title: "Распределение резерва 50 МВт", description: "Выбери приоритетных потребителей для оставшихся 50 МВт.", type: "checkbox", options: [{ id: "factory", text: "Завод (35 МВт)", correct: false }, { id: "hospital", text: "Больница (10 МВт)", correct: true }, { id: "residential", text: "Жилой район (15 МВт)", correct: true }], maxScore: 15 },
    { id: 3, title: "Авария: обрыв ЛЭП", description: "Произошёл обрыв линии электропередачи.", type: "choice", options: [{ text: "Отключить всё, пока чинят", correct: false }, { text: "Отключить хлебозавод, дать свет в дома и школу", correct: true }, { text: "Дать свет хлебозаводу, отключить дома", correct: false }], maxScore: 20, emergency: true },
  ];
  if (profession === "inspector") return [
    { id: 1, title: "Осмотр стены", description: "Найди 3 дефекта на стене (A1-трещина, B2-шов, C3-вздутие).", type: "choice", options: [{ text: "Трещина в A1, шов B2, вздутие C3", correct: true }, { text: "Вздутие A1, трещина B3", correct: false }, { text: "Нет дефектов", correct: false }], maxScore: 10 },
    { id: 2, title: "Проверка документации", description: "Сравни акт бригады с нормативом СНиП. Найди 3 ошибки.", type: "checkbox", options: [{ id: "diam", text: "Диаметр арматуры: 10 мм вместо 12 мм", correct: true }, { id: "beton", text: "Марка бетона: М200 вместо М300", correct: true }, { id: "sign", text: "Подпись КК отсутствует", correct: true }, { id: "step", text: "Шаг армирования: 200 мм (верно)", correct: false }], maxScore: 15 },
    { id: 3, title: "Звонок заказчика", description: "Директор звонит и давит подписать акт приёмки раньше срока.", type: "choice", options: [{ text: "Подписать — директору виднее", correct: false }, { text: "Отказать — провести полную проверку", correct: true }, { text: "Подписать задним числом", correct: false }], maxScore: 20 },
  ];
  return [];
}

export default function GameModal({ company, profession, onClose, showToast }) {
  const { state, dispatch } = useGameState();
  const tasks = getTasks(profession);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskResults, setTaskResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceState, setInvoiceState] = useState("arriving");
  const [workerAssignments, setWorkerAssignments] = useState(null);
  const timer = useTimer();
  const invoiceTimerRef = useRef(null);

  useEffect(() => { timer.start(); console.log(`[Marshrutka] GameModal opened: ${profession}`); }, []);

  useEffect(() => {
    if (invoiceState === "arriving" && currentTaskIdx === 0 && profession === "foreman") {
      if (invoiceTimerRef.current) clearTimeout(invoiceTimerRef.current);
      invoiceTimerRef.current = setTimeout(() => {
        setInvoiceState("showing");
        console.log("[Marshrutka] Invoice state → showing");
      }, 4000);
      return () => { if (invoiceTimerRef.current) clearTimeout(invoiceTimerRef.current); };
    }
  }, [currentTaskIdx, profession]);

  const finishGame = useCallback(() => {
    dispatch({ type: "SAVE_GAME_HISTORY", payload: { profession } });
    dispatch({ type: "COMPLETE_PIECE", payload: { companyId: company.id, pieceIndex: 3, choice: null } });
    if (taskResults.length === 3 && taskResults.every(r => r.correct)) {
      dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "perfectionist" });
    }
    setShowResult(true);
  }, [taskResults, dispatch, company.id, profession]);

  const submitAnswer = useCallback((score, correct, timeMs) => {
    const task = tasks[currentTaskIdx];
    const bonus = correct ? timeBonus(task.id, timeMs) : 0;
    const result = { taskId: task.id, score: score + bonus, time: Math.floor(timeMs / 1000), correct };
    setTaskResults(prev => [...prev, result]);
    dispatch({ type: "SAVE_TASK_RESULT", payload: { companyId: company.id, ...result } });
    if (timeMs < 30000) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "quick_solver" });
    if (profession === "foreman" && task.id === 3 && correct) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "found_solution" });
    if (profession === "inspector" && task.id === 3 && correct) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "honest_inspector" });
  }, [currentTaskIdx, tasks, dispatch, company.id, profession]);

  const handleChoice = useCallback(() => {
    if (isProcessing || selectedOption === null) return;
    setIsProcessing(true);
    const task = tasks[currentTaskIdx];
    const timeMs = timer.stop();
    const correct = task.options[selectedOption]?.correct || false;
    const score = correct ? task.maxScore : 0;
    submitAnswer(score, correct, timeMs);
    showToast(`${correct ? "Верно!" : "Ошибка"} +${score + (correct ? timeBonus(task.id, timeMs) : 0)} баллов`);
    setTimeout(() => { setIsProcessing(false); setSelectedOption(null); if (currentTaskIdx < tasks.length - 1) { setCurrentTaskIdx(prev => prev + 1); timer.start(); } else finishGame(); }, 600);
  }, [isProcessing, selectedOption, currentTaskIdx, tasks, timer, submitAnswer, showToast, finishGame]);

  const handleCheckbox = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    const task = tasks[currentTaskIdx];
    const timeMs = timer.stop();
    const correctSet = new Set(task.options.filter(o => o.correct).map(o => o.id));
    const selectedSet = new Set(selectedCheckboxes);
    const allCorrect = correctSet.size === selectedSet.size && [...correctSet].every(id => selectedSet.has(id));
    const partlyCorrect = [...selectedSet].some(id => correctSet.has(id));
    const score = allCorrect ? task.maxScore : partlyCorrect ? Math.floor(task.maxScore / 2) : 0;
    submitAnswer(score, allCorrect, timeMs);
    if (profession === "energy" && task.id === 2 && allCorrect) dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "responsible" });
    showToast(`${allCorrect ? "Верно!" : "Частично"} +${score + (allCorrect ? timeBonus(task.id, timeMs) : 0)} баллов`);
    setTimeout(() => { setIsProcessing(false); setSelectedCheckboxes([]); if (currentTaskIdx < tasks.length - 1) { setCurrentTaskIdx(prev => prev + 1); timer.start(); } else finishGame(); }, 600);
  }, [isProcessing, selectedCheckboxes, currentTaskIdx, tasks, timer, submitAnswer, dispatch, profession, showToast, finishGame]);

  const handleInvoiceAnswer = useCallback((accepted) => {
    if (isProcessing || invoiceState !== "showing") return;
    setIsProcessing(true);
    const timeMs = timer.stop();
    const correct = accepted;
    const score = accepted ? 10 : 0;
    submitAnswer(score, correct, timeMs);
    showToast(`${accepted ? "✅ +10 баллов! Правильное решение" : "❌ Неправильно!"} +${score + (correct ? timeBonus(1, timeMs) : 0)} баллов`);
    setInvoiceState("departing");
    setTimeout(() => { setInvoiceState("done"); setIsProcessing(false); if (currentTaskIdx < tasks.length - 1) { setCurrentTaskIdx(prev => prev + 1); timer.start(); } else finishGame(); }, 3500);
  }, [isProcessing, invoiceState, currentTaskIdx, tasks, timer, submitAnswer, showToast, finishGame]);

  const handleDragDropComplete = useCallback((score, correct, message, fIds, wIds) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setWorkerAssignments({ foundation: fIds, walls: wIds });
    const timeMs = timer.stop();
    submitAnswer(score, correct, timeMs);
    showToast(`${message} +${score + (correct ? timeBonus(3, timeMs) : 0)} баллов`);
    setTimeout(() => { setIsProcessing(false); if (currentTaskIdx < tasks.length - 1) { setCurrentTaskIdx(prev => prev + 1); timer.start(); } else finishGame(); }, 2500);
  }, [isProcessing, currentTaskIdx, tasks, timer, submitAnswer, showToast, finishGame]);

  const totalScore = taskResults.reduce((sum, r) => sum + r.score, 0);
  const maxPossible = 55;
  const currentTask = tasks[currentTaskIdx];
  const cameraPos = profession === "foreman" ? [10, 8, 10] : profession === "energy" ? [0, 1.8, 5] : [0, 1.7, 3.5];
  const showInvoiceHint = currentTask?.type === "invoice" && invoiceState === "arriving";

  return (
    <div className="modal-backdrop open" style={{ zIndex: 300 }}>
      <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 301 }}>
        {hasWebGL && (
          <Canvas shadows camera={{ position: cameraPos, fov: 45 }}
            onCreated={({ camera }) => {
              if (profession === "foreman") camera.lookAt(0, 1, 0);
              else if (profession === "energy") camera.lookAt(0, 1.5, -1);
              else camera.lookAt(0, 1.5, 0);
            }}>
            <ambientLight intensity={0.6} />
            <Suspense fallback={null}>
              {profession === "foreman" && <ConstructionSiteR3F taskIndex={currentTask?.id || 1} highlightZones={currentTask?.id === 2} emergencyMode={currentTask?.emergency || false} truckArrived={currentTask?.id === 1 && invoiceState !== "done"} truckDeparting={invoiceState === "departing"} wallsVisible={currentTask?.id >= 3} workerAssignments={workerAssignments} />}
              {profession === "energy" && <DispatchRoomR3F taskIndex={currentTask?.id || 1} emergencyMode={currentTask?.emergency || false} />}
              {profession === "inspector" && <InspectionSiteR3F taskIndex={currentTask?.id || 1} />}
            </Suspense>
            <OrbitControls enablePan={profession !== "inspector"} enableZoom={true} maxPolarAngle={Math.PI / 2.2} />
          </Canvas>
        )}
        {showResult && (
          <div style={{ position: "absolute", inset: 0, zIndex: 310, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(9,11,19,.9)" }}>
            <div className="results-screen" style={{ background: "transparent" }}>
              <h1 className="results-title">Результаты</h1>
              <div className="results-score"><span className="score-label">Твой результат:</span><span className="score-value">{totalScore}</span><span className="score-max"> / {maxPossible}</span></div>
              <div className="results-actions"><button className="button button-primary" onClick={onClose}>На карту станций →</button></div>
            </div>
          </div>
        )}
        {!showResult && (
          <>
            <div className="hud-overlay" style={{ zIndex: 310, position: "absolute", top: 0, left: 0, right: 0 }}>
              <div className="hud-top">
                <div className="hud-item"><span className="hud-icon">🎓</span><span>{state.profile?.name?.split(" ")[0] || "Игрок"}</span></div>
                <div className="hud-item"><span className="hud-icon">🏢</span><span>{company.short}</span></div>
                <div className="hud-item"><span className="hud-icon">⭐</span><span>{totalScore}</span>/{maxPossible}</div>
                <div className="hud-item"><span className="hud-icon">📋</span>Задача {currentTaskIdx + 1}/{tasks.length}</div>
                <div className="hud-item timer"><span className="hud-icon">⏱️</span><span>{timer.formatted}</span></div>
              </div>
            </div>
            <div className="progress-indicators" style={{ zIndex: 311 }}>
              {tasks.map((t, i) => (<div key={i} className="progress-item"><div className={`progress-circle ${i < currentTaskIdx ? (taskResults[i]?.correct ? "done" : "wrong") : i === currentTaskIdx ? "active" : ""}`}></div><span>{i + 1}</span></div>))}
            </div>
            {showInvoiceHint && (
              <div style={{ position: "absolute", bottom: 120, left: "50%", transform: "translateX(-50%)", zIndex: 315, background: "rgba(20,24,37,.95)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>
                🚚 Грузовик подъезжает к площадке...
              </div>
            )}
            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 320, width: "100%", maxWidth: 760, padding: "0 16px" }}>
              {currentTask?.type === "dragdrop" ? (
                <DragDropPanel onComplete={handleDragDropComplete} onCancel={() => { showToast("Задача отменена. +0 баллов"); handleDragDropComplete(0, false, "Задача отменена", [], []); }} />
              ) : (
                <div className="task-box" style={{ background: "rgba(20,24,37,.95)", border: "1px solid var(--line)", backdropFilter: "blur(8px)" }}>
                  <b>ЗАДАЧА {currentTask?.id || 1}/3</b>
                  <p>{currentTask?.description}</p>
                  {currentTask?.type === "invoice" && invoiceState === "showing" && (
                    <div className="document-view" style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: 20, color: "#222" }}>
                      <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: 12, marginBottom: 16 }}>
                        <h4 style={{ fontSize: 18, marginBottom: 4 }}>ТОВАРНАЯ НАКЛАДНАЯ №1234</h4>
                        <p style={{ fontSize: 13, color: "#555" }}>от {new Date().toLocaleDateString("ru-RU")}</p>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                        <thead><tr style={{ background: "#f5f5f5" }}><th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "left", fontWeight: 600 }}>Материал</th><th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "left", fontWeight: 600 }}>Заказано</th><th style={{ padding: "8px 10px", border: "1px solid #ddd", textAlign: "left", fontWeight: 600 }}>Доставлено</th></tr></thead>
                        <tbody>
                          <tr><td style={{ padding: "8px 10px", border: "1px solid #ddd" }}>Кирпич керамический</td><td style={{ padding: "8px 10px", border: "1px solid #ddd" }}>500 шт</td><td style={{ padding: "8px 10px", border: "1px solid #ddd" }}>520 шт <span style={{ color: "#22c55e" }}>✓</span></td></tr>
                          <tr><td style={{ padding: "8px 10px", border: "1px solid #ddd" }}>Качество</td><td colSpan={2} style={{ padding: "8px 10px", border: "1px solid #ddd" }}><span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: "#d4edda", color: "#155724", fontWeight: 600, fontSize: 13 }}>НОРМА</span></td></tr>
                          <tr><td style={{ padding: "8px 10px", border: "1px solid #ddd" }}>Документы</td><td colSpan={2} style={{ padding: "8px 10px", border: "1px solid #ddd" }}><span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: "#d4edda", color: "#155724", fontWeight: 600, fontSize: 13 }}>В ПОРЯДКЕ</span></td></tr>
                        </tbody>
                      </table>
                      <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>💡 <strong>Совет:</strong> Излишек 20 шт — допустимо. Качество и документы в порядке.</p>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button className="button button-ghost compact" onClick={() => handleInvoiceAnswer(false)}>❌ Отказать</button>
                        <button className="button button-primary compact" onClick={() => handleInvoiceAnswer(true)}>✅ Принять</button>
                      </div>
                    </div>
                  )}
                  {currentTask?.type === "choice" && (
                    <div className="options-list">{currentTask.options.map((opt, i) => (<button key={i} className={`option-item ${selectedOption === i ? "selected" : ""}`} onClick={() => setSelectedOption(i)} disabled={isProcessing}>{opt.text}</button>))}</div>
                  )}
                  {currentTask?.type === "checkbox" && (
                    <div className="options-list">{currentTask.options.map(opt => (<label key={opt.id} className={`option-item ${selectedCheckboxes.includes(opt.id) ? "selected" : ""}`}><input type="checkbox" checked={selectedCheckboxes.includes(opt.id)} onChange={() => setSelectedCheckboxes(prev => prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id])} disabled={isProcessing} />{opt.text}</label>))}</div>
                  )}
                  {currentTask?.type !== "invoice" && (
                    <div className="modal-actions">
                      <button className="button button-ghost compact" onClick={onClose}>Выйти</button>
                      {currentTask?.type === "checkbox" ? (
                        <button className="button button-primary compact" disabled={selectedCheckboxes.length === 0 || isProcessing} onClick={handleCheckbox}>Ответить</button>
                      ) : (
                        <button className="button button-primary compact" disabled={selectedOption === null || isProcessing} onClick={handleChoice}>Ответить</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}