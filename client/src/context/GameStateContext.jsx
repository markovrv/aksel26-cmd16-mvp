import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import companies from "../data/companies.js";
import achievements from "../data/achievements.js";

// --- Default state ---
const defaultState = {
  profile: null,            // { name, email, category, createdAt }
  role: "student",          // "student" | "teacher" | "hr"
  track: null,              // null | "business" | "career"
  score: 0,
  level: "новичок",
  avatar: { skin: "#f0b38f", hair: "#37251c", suit: "#536dfe" },
  avatarCreated: false,
  answers: [],              // баллы ответов диагностики
  skills: { initiative: 20, analytics: 20, team: 20 },
  completed: {},            // { [companyId]: { pieces: number[], choice: string | null, taskResults: [...] } }
  tours: [],                // [{ companyId, date, phone, status }]
  achievements: [],         // string[] — ID достижений
  gameHistory: [],          // [{ profession: "foreman"|"engineer"|"inspector", timestamp }]
  currentGame: null,        // null | { profession, currentTask, scores, taskTimes, choices, taskCompleted, startTime }
};

// --- Helpers ---
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("marshrutka-state-v2"));
    if (!saved) return structuredClone(defaultState);
    // Проверка структуры: если версия изменилась — сброс с предупреждением
    if (!saved.skills || !saved.completed || !saved.tours || !saved.achievements) {
      console.warn("[Marshrutka] Структура localStorage изменилась, сбрасываем до defaultState");
      return structuredClone(defaultState);
    }
    return { ...structuredClone(defaultState), ...saved };
  } catch (e) {
    console.warn("[Marshrutka] Ошибка чтения localStorage, сброс:", e);
    return structuredClone(defaultState);
  }
}

function saveState(state) {
  try {
    localStorage.setItem("marshrutka-state-v2", JSON.stringify(state));
  } catch (e) {
    console.warn("[Marshrutka] Ошибка записи localStorage:", e);
  }
}

function getLevel(score) {
  if (score >= 450) return "эксперт";
  if (score >= 250) return "мастер";
  if (score >= 100) return "стажёр";
  return "новичок";
}

function completedPieces(state, companyId) {
  return state.completed[companyId]?.pieces || [];
}

function stationComplete(state, companyId) {
  return completedPieces(state, companyId).length === 4;
}

function completedStationCount(state) {
  return companies.filter(c => stationComplete(state, c.id)).length;
}

function isStationUnlocked(state, index) {
  if (!state.profile || !state.track || !state.avatarCreated) return false;
  if (index === 0) return true;
  return stationComplete(state, companies[index - 1].id);
}

// Проверка разблокировки Инженера КК (КЗЦМ — индекс 4)
function isInspectorUnlocked(state) {
  const foremanDone = state.gameHistory.some(h => h.profession === "foreman");
  const energyDone = state.gameHistory.some(h => h.profession === "engineer");
  return foremanDone && energyDone;
}

function checkAchievements(state) {
  const newAchievements = [...state.achievements];
  const unlock = (id) => {
    if (!newAchievements.includes(id)) {
      newAchievements.push(id);
      console.log(`[Marshrutka] Достижение разблокировано: ${id}`);
    }
  };

  if (state.profile) unlock("member");
  if (state.track) unlock("track_found");
  if (state.avatarCreated) unlock("avatar_built");

  const completed = completedStationCount(state);
  if (completed >= 1) unlock("first_station");
  if (completed >= 3) unlock("equator");
  if (completed >= 6) unlock("finalist");

  // Проверка игровых достижений
  const allGameHistory = [
    ...state.gameHistory,
    ...(state.currentGame && state.currentGame.profession
      ? [{ profession: state.currentGame.profession }]
      : [])
  ];
  const foremanDone = allGameHistory.some(h => h.profession === "foreman");
  const energyDone = allGameHistory.some(h => h.profession === "engineer");
  const inspectorDone = allGameHistory.some(h => h.profession === "inspector");
  if (foremanDone && energyDone && inspectorDone) unlock("master_builder");

  return newAchievements;
}

function recomputeSkills(state) {
  const skills = { initiative: 30, analytics: 30, team: 30 };
  if (state.track === "business") skills.initiative += 20;
  else if (state.track === "career") skills.analytics += 20;

  Object.entries(state.completed).forEach(([companyId, progress]) => {
    progress.pieces.forEach(pieceIndex => {
      const skillKeys = ["analytics", "initiative", "team", "initiative"];
      skills[skillKeys[pieceIndex]] = Math.min(100, skills[skillKeys[pieceIndex]] + 5);
    });
    if (progress.taskResults) {
      progress.taskResults.forEach(tr => {
        if (tr.correct) {
          skills.initiative = Math.min(100, skills.initiative + 1);
          skills.analytics = Math.min(100, skills.analytics + 1);
        }
      });
    }
  });

  return skills;
}

// --- Reducer ---
function reducer(state, action) {
  const newState = { ...state };

  switch (action.type) {
    case "SET_PROFILE": {
      newState.profile = {
        ...action.payload,
        createdAt: action.payload.createdAt || new Date().toISOString()
      };
      break;
    }
    case "SET_TRACK": {
      newState.track = action.payload.track;
      newState.answers = action.payload.answers;
      break;
    }
    case "SET_AVATAR": {
      newState.avatar = { ...newState.avatar, ...action.payload };
      if (!newState.avatarCreated) {
        newState.avatarCreated = true;
        newState.score += 25;
      }
      break;
    }
    case "ADD_SCORE": {
      newState.score += action.payload;
      break;
    }
    case "COMPLETE_PIECE": {
      const { companyId, pieceIndex, choice } = action.payload;
      if (!newState.completed[companyId]) {
        newState.completed[companyId] = { pieces: [], choice: null, taskResults: [] };
      }
      const progress = newState.completed[companyId];
      if (!progress.pieces.includes(pieceIndex)) {
        progress.pieces = [...progress.pieces, pieceIndex].sort();
        if (pieceIndex === 3 && choice !== undefined) progress.choice = choice;
        // Баллы по ТЗ: блоки 0,1,2 = 20, блок 3 = 35 (дополнительно к задачам)
        newState.score += pieceIndex === 3 ? 35 : 20;
      }
      break;
    }
    case "SAVE_TASK_RESULT": {
      const { companyId, taskId, score, time, correct } = action.payload;
      if (!newState.completed[companyId]) {
        newState.completed[companyId] = { pieces: [], choice: null, taskResults: [] };
      }
      const progress = newState.completed[companyId];
      if (!progress.taskResults) progress.taskResults = [];
      const existing = progress.taskResults.find(tr => tr.taskId === taskId);
      if (!existing) {
        progress.taskResults = [...progress.taskResults, { taskId, score, time, correct }];
        newState.score += score;
      }
      break;
    }
    case "SAVE_GAME_HISTORY": {
      const { profession } = action.payload;
      if (!newState.gameHistory.some(h => h.profession === profession)) {
        newState.gameHistory = [...newState.gameHistory, { profession, timestamp: Date.now() }];
      }
      break;
    }
    case "SET_CURRENT_GAME": {
      newState.currentGame = action.payload;
      break;
    }
    case "UPDATE_CURRENT_GAME": {
      if (newState.currentGame) {
        newState.currentGame = { ...newState.currentGame, ...action.payload };
      }
      break;
    }
    case "ADD_TOUR": {
      newState.tours = [...newState.tours, { ...action.payload, status: "pending" }];
      newState.score += 15;
      break;
    }
    case "UNLOCK_ACHIEVEMENT": {
      const id = action.payload;
      if (!newState.achievements.includes(id)) {
        newState.achievements = [...newState.achievements, id];
      }
      break;
    }
    case "SET_ROLE": {
      newState.role = action.payload;
      break;
    }
    case "RESET_STATE": {
      return structuredClone(defaultState);
    }
    default:
      return state;
  }

  // Пересчёт уровня
  newState.level = getLevel(newState.score);
  // Пересчёт навыков
  newState.skills = recomputeSkills(newState);
  // Пересчёт достижений
  newState.achievements = checkAchievements(newState);

  // Сохраняем в localStorage
  saveState(newState);

  return newState;
}

// --- Context ---
const GameStateContext = createContext(null);

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    console.log("[Marshrutka] State loaded:", {
      hasProfile: !!state.profile,
      track: state.track,
      score: state.score,
      level: state.level,
      completedStations: completedStationCount(state)
    });
  }, []);

  const isStationUnlockedFn = useCallback(
    (index) => isStationUnlocked(state, index),
    [state.completed, state.profile, state.track, state.avatarCreated]
  );

  const stationCompleteFn = useCallback(
    (companyId) => stationComplete(state, companyId),
    [state.completed]
  );

  const completedPiecesFn = useCallback(
    (companyId) => completedPieces(state, companyId),
    [state.completed]
  );

  const completedStationCountFn = useCallback(
    () => completedStationCount(state),
    [state.completed]
  );

  const isInspectorUnlockedFn = useCallback(
    () => isInspectorUnlocked(state),
    [state.gameHistory]
  );

  const value = {
    state,
    dispatch,
    companies,
    achievements,
    isStationUnlocked: isStationUnlockedFn,
    stationComplete: stationCompleteFn,
    completedPieces: completedPiecesFn,
    completedStationCount: completedStationCountFn,
    isInspectorUnlocked: isInspectorUnlockedFn,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be inside GameStateProvider");
  return ctx;
}

export default GameStateContext;