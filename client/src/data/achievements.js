// Достижения (из игры + v1)
const achievements = [
  // v1 достижения
  { id: "member", name: "Участник", icon: "ID", desc: "Профиль создан", condition: "hasProfile" },
  { id: "track_found", name: "Трек найден", icon: "AI", desc: "Диагностика пройдена", condition: "hasTrack" },
  { id: "avatar_built", name: "Образ собран", icon: "3D", desc: "Аватар создан", condition: "hasAvatar" },
  { id: "first_station", name: "Первая станция", icon: "01", desc: "Одна станция пройдена", condition: "stationsCompleted >= 1" },
  { id: "equator", name: "Экватор пути", icon: "03", desc: "Три станции пройдены", condition: "stationsCompleted >= 3" },
  { id: "finalist", name: "Финалист", icon: "GO", desc: "Все станции пройдены", condition: "stationsCompleted >= 6" },

  // Игровые достижения (из GameStateManager)
  { id: "quick_solver", name: "Быстрый решатель", icon: "⚡", desc: "Задача выполнена за <30 сек", condition: "anyTaskUnder30s" },
  { id: "perfectionist", name: "Перфекционист", icon: "💎", desc: "Все задачи верны с первой попытки", condition: "allTasksPerfect" },
  { id: "found_solution", name: "Нашёл решение", icon: "🔧", desc: "Правильный вариант в задаче 3 (Прораб)", condition: "foremanTask3Correct" },
  { id: "responsible", name: "Ответственный диспетчер", icon: "📊", desc: "Правильные приоритеты (Энергетик)", condition: "engineerTask2Correct" },
  { id: "ethical", name: "Этичный работник", icon: "🤝", desc: "Ни одного нечестного выбора", condition: "noBadChoices" },
  { id: "honest_inspector", name: "Честный инспектор", icon: "🔬", desc: "Отказ подписать акт (Инженер КК)", condition: "inspectorTask3Refused" },
  { id: "master_builder", name: "Мастер строительной отрасли", icon: "🏆", desc: "Пройдены все 3 игровые профессии", condition: "allGameProfessions" }
];

export default achievements;