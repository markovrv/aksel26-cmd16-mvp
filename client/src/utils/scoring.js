// Логика баллов, бонусов и достижений
const BONUS_THRESHOLDS = {
  1: { ms: 20000, bonus: 3 },
  2: { ms: 45000, bonus: 5 },
  3: { ms: 15000, bonus: 2 },
};

/**
 * Вычисляет бонус за скорость
 * @returns {number} количество бонусных баллов
 */
export function timeBonus(taskNum, timeMs) {
  const t = BONUS_THRESHOLDS[taskNum];
  if (t && timeMs < t.ms) return t.bonus;
  return 0;
}

/**
 * Возвращает максимальный балл за задачу
 */
export function maxTaskScore(taskNum) {
  const base = { 1: 10, 2: 15, 3: 20 };
  const bonus = BONUS_THRESHOLDS[taskNum]?.bonus || 0;
  return (base[taskNum] || 0) + bonus;
}

/**
 * Форматирует время из секунд в MM:SS
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Форматирует миллисекунды в секунды с десятыми
 */
export function formatMs(ms) {
  return (ms / 1000).toFixed(1) + "с";
}

/**
 * Возвращает уровень по баллам
 */
export function getLevel(score) {
  if (score >= 450) return "эксперт";
  if (score >= 250) return "мастер";
  if (score >= 100) return "стажёр";
  return "новичок";
}

/**
 * Названия треков
 */
export function trackTitle(track) {
  return track === "business"
    ? "ТЕХНОЛОГИЧЕСКИЙ ПРЕДПРИНИМАТЕЛЬ"
    : "КАРЬЕРА В ИНДУСТРИИ";
}

export function trackShort(track) {
  return track === "business" ? "Предпринимательство" : "Карьера в найме";
}