const companies = [
  {
    id: "leps",
    name: "Электромашиностроительный завод ЛЕПСЕ",
    short: "ЛЕПСЕ",
    type: "Авиация и электротехника",
    accent: "#536dfe",
    history: "Одно из ключевых предприятий региона, выпускающее электрические машины и оборудование для авиационной промышленности.",
    products: ["Авиационные электродвигатели", "Электронасосные агрегаты", "Системы автоматики"],
    careers: ["Инженер-конструктор", "Технолог производства", "Оператор станков с ЧПУ"],
    partners: ["Авиастроительные компании", "Технические вузы", "Региональные колледжи"]
  },
  {
    id: "mayak",
    name: "Кировский машзавод 1 Мая",
    short: "1 МАЯ",
    type: "Транспортное машиностроение",
    accent: "#ff6f61",
    history: "Предприятие создаёт сложную железнодорожную технику и машины для обслуживания транспортной инфраструктуры.",
    products: ["Путевые машины", "Подъёмное оборудование", "Специальные платформы"],
    careers: ["Инженер-механик", "Сварщик", "Специалист по качеству"],
    partners: ["Российские железные дороги", "Машиностроительные холдинги", "Учебные центры"]
  },
  {
    id: "vmp",
    name: "Вятское машиностроительное предприятие",
    short: "ВМП",
    type: "Промышленное оборудование",
    accent: "#5ce1b9",
    history: "Современная производственная площадка, где инженерные решения превращаются в оборудование для разных отраслей.",
    products: ["Металлоконструкции", "Промышленные узлы", "Нестандартное оборудование"],
    careers: ["Проектировщик", "Мастер участка", "Инженер по автоматизации"],
    partners: ["Строительные компании", "Промышленные заказчики", "Инженерные бюро"]
  },
  {
    id: "biohim",
    name: "Кировский биохимзавод",
    short: "БИОХИМ",
    type: "Биотехнологии",
    accent: "#b887ff",
    history: "Производственная площадка с глубокой экспертизой в химических и биотехнологических процессах.",
    products: ["Биохимические компоненты", "Технические спирты", "Продукты глубокой переработки"],
    careers: ["Химик-технолог", "Лаборант", "Инженер-эколог"],
    partners: ["Научные институты", "Химические компании", "Аграрный сектор"]
  },
  {
    id: "kccm",
    name: "Кировский завод цветных металлов",
    short: "КЗЦМ",
    type: "Металлургия",
    accent: "#ff9d36",
    history: "Предприятие перерабатывает цветные металлы и создаёт продукцию, востребованную в высокотехнологичных отраслях.",
    products: ["Прокат цветных металлов", "Сплавы", "Промышленные заготовки"],
    careers: ["Металлург", "Инженер по качеству", "Специалист по логистике"],
    partners: ["Промышленные холдинги", "Энергетические компании", "Исследовательские лаборатории"]
  },
  {
    id: "final",
    name: "Финальная лаборатория",
    short: "ФИНАЛ",
    type: "Персональная траектория",
    accent: "#ffd629",
    history: "Здесь все решения маршрута соединяются в персональный проект или карьерный план.",
    products: ["Идея проекта", "Карта обучения", "Портфолио навыков"],
    careers: ["Автор проекта", "Будущий специалист", "Участник стажировки"],
    partners: ["Предприятия маршрута", "Колледжи и вузы", "Центры занятости"]
  }
];

const questions = [
  {
    text: "Какой результат общего проекта радует тебя больше?",
    answers: [
      { text: "Мы придумали новое решение и убедили других его попробовать", score: 2, skill: "initiative" },
      { text: "Мы сделали сложную работу качественно и точно в срок", score: -2, skill: "team" },
      { text: "Я разобрался, как всё устроено, и улучшил процесс", score: 0, skill: "analytics" }
    ]
  },
  {
    text: "Представь, у тебя есть свободные 20 000 рублей на полезный опыт. Что выберешь?",
    answers: [
      { text: "Соберу прототип продукта и проверю, нужен ли он людям", score: 2, skill: "initiative" },
      { text: "Пройду сильный курс и соберу портфолио для работодателя", score: -2, skill: "analytics" },
      { text: "Поеду на отраслевой форум и познакомлюсь с командами", score: 1, skill: "team" }
    ]
  },
  {
    text: "Что ты обычно делаешь, когда задача сформулирована неясно?",
    answers: [
      { text: "Сам определяю цель и начинаю проверять гипотезы", score: 2, skill: "initiative" },
      { text: "Уточняю критерии и согласую план с наставником", score: -1, skill: "team" },
      { text: "Собираю данные и раскладываю проблему на части", score: 0, skill: "analytics" }
    ]
  },
  {
    text: "Какую роль ты чаще выбираешь в команде?",
    answers: [
      { text: "Предлагаю направление и собираю людей вокруг идеи", score: 2, skill: "initiative" },
      { text: "Беру конкретный участок и становлюсь в нём экспертом", score: -2, skill: "analytics" },
      { text: "Слежу, чтобы все договорились и двигались вместе", score: -1, skill: "team" }
    ]
  },
  {
    text: "Как ты относишься к риску ошибиться?",
    answers: [
      { text: "Нормально, если ошибка быстрая и помогает проверить идею", score: 2, skill: "initiative" },
      { text: "Стараюсь заранее снизить риск расчётами и проверками", score: -1, skill: "analytics" },
      { text: "Предпочитаю опираться на опыт сильной команды", score: -2, skill: "team" }
    ]
  },
  {
    text: "Какая промышленная задача кажется наиболее интересной?",
    answers: [
      { text: "Найти новый продукт, который предприятие сможет продавать", score: 2, skill: "initiative" },
      { text: "Освоить современное оборудование и стать сильным специалистом", score: -2, skill: "analytics" },
      { text: "Организовать процесс так, чтобы команда работала эффективнее", score: 0, skill: "team" }
    ]
  },
  {
    text: "Где ты хотел бы оказаться через пять лет?",
    answers: [
      { text: "Запускаю собственный технологический проект", score: 3, skill: "initiative" },
      { text: "Работаю в сильной компании и расту как профессионал", score: -3, skill: "analytics" },
      { text: "Пока хочу попробовать оба варианта на практике", score: 0, skill: "team" }
    ]
  }
];

const rewards = [
  { id: "tour", title: "Приглашение на экскурсию", description: "Место в организованной группе на одном из предприятий маршрута.", price: 320, art: "GO", color: "#ffd629" },
  { id: "hoodie", title: "Худи «Инженер будущего»", description: "Лимитированный мерч платформы. Демо-позиция будущего маркета.", price: 700, art: "HD", color: "#536dfe" },
  { id: "badge", title: "Набор промышленных значков", description: "Коллекционные значки отраслей, пройденных в маршруте.", price: 180, art: "PIN", color: "#ff6f61" },
  { id: "mentor", title: "Встреча с инженером", description: "Короткая профориентационная встреча с сотрудником предприятия.", price: 520, art: "1:1", color: "#5ce1b9" },
  { id: "workshop", title: "Мастер-класс по прототипированию", description: "Практическое занятие по созданию первого промышленного прототипа.", price: 450, art: "LAB", color: "#b887ff" },
  { id: "case", title: "Закрытый бизнес-кейс", description: "Дополнительная задача от предприятия для цифрового портфолио.", price: 240, art: "CASE", color: "#ff9d36" }
];

const defaultState = {
  profile: null,
  track: null,
  score: 0,
  avatar: { skin: "#f0b38f", suit: "#536dfe", hair: "#37251c" },
  avatarCreated: false,
  answers: [],
  skills: { initiative: 20, analytics: 20, team: 20 },
  completed: {},
  tours: [],
  rewards: []
};

let state = loadState();
let activeQuestion = 0;
let temporaryAnswers = [];
let activeStation = null;
let activePiece = null;
let toastTimer = null;

const screens = {
  home: document.getElementById("homeScreen"),
  route: document.getElementById("routeScreen"),
  market: document.getElementById("marketScreen"),
  profile: document.getElementById("profileScreen")
};

const pieceLabels = ["История", "Продукты", "Профессии", "Твой выбор"];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("marshrutka-state"));
    return { ...structuredClone(defaultState), ...saved };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem("marshrutka-state", JSON.stringify(state));
}

function completedPieces(companyId) {
  return state.completed[companyId]?.pieces || [];
}

function stationComplete(companyId) {
  return completedPieces(companyId).length === 4;
}

function completedStationCount() {
  return companies.filter(company => stationComplete(company.id)).length;
}

function isStationUnlocked(index) {
  if (!state.track || !state.profile) return false;
  if (index === 0) return true;
  return stationComplete(companies[index - 1].id);
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("active", key === name);
  });
  document.querySelectorAll("[data-nav]").forEach(button => {
    button.classList.toggle("active", button.dataset.nav === name && button.classList.contains("nav-link"));
  });
  document.querySelector(".main-nav").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "route") renderRoute();
  if (name === "market") renderMarket();
  if (name === "profile") renderProfile();
}

function applyAvatar(element, avatar = state.avatar) {
  if (!element) return;
  element.style.setProperty("--skin", avatar.skin);
  element.style.setProperty("--suit", avatar.suit);
  element.style.setProperty("--hair", avatar.hair);
}

function renderHeader() {
  document.getElementById("scoreValue").textContent = state.score;
  document.getElementById("profileName").textContent = state.profile?.name?.split(" ")[0] || "Гость";
  applyAvatar(document.getElementById("miniAvatar"));
  applyAvatar(document.getElementById("heroAvatar"));
  document.getElementById("heroTrack").textContent = state.track ? trackTitle(state.track) : "ЕЩЁ НЕ ОПРЕДЕЛЁН";
  const next = companies.find((company, index) => isStationUnlocked(index) && !stationComplete(company.id));
  document.getElementById("nextStation").textContent = next ? next.short : state.track ? "МАРШРУТ ЗАВЕРШЁН" : "ПРОЙДИ ДИАГНОСТИКУ";
}

function renderMiniRoute() {
  document.getElementById("miniRoute").innerHTML = companies.map((company, index) => `
    <div class="mini-node">
      <div class="mini-node-mark">${String(index + 1).padStart(2, "0")}</div>
      <b>${company.short}</b>
      <small>${company.type}</small>
    </div>
  `).join("");
}

function trackTitle(track) {
  return track === "business" ? "ТЕХНОЛОГИЧЕСКИЙ ПРЕДПРИНИМАТЕЛЬ" : "КАРЬЕРА В ИНДУСТРИИ";
}

function trackShort(track) {
  return track === "business" ? "Предпринимательство" : "Карьера в найме";
}

function renderRoute() {
  const completed = completedStationCount();
  const percent = Math.round(completed / companies.length * 100);
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("progressRing").style.setProperty("--progress", `${percent * 3.6}deg`);
  document.getElementById("routeProgressText").textContent = `${completed} из ${companies.length} станций`;
  document.getElementById("routeTrackBadge").textContent = state.track ? trackShort(state.track) : "Не определён";

  const skillMap = [
    ["Инициатива", state.skills.initiative],
    ["Аналитика", state.skills.analytics],
    ["Командность", state.skills.team]
  ];
  document.getElementById("skillBars").innerHTML = skillMap.map(([label, value]) => `
    <div><span>${label}</span><i><b style="width:${Math.min(100, value)}%"></b></i></div>
  `).join("");

  const mission = getMission();
  document.getElementById("missionTitle").textContent = mission.title;
  document.getElementById("missionText").textContent = mission.text;
  document.getElementById("missionButton").textContent = mission.button;
  document.getElementById("missionButton").onclick = mission.action;

  document.getElementById("routeMap").innerHTML = companies.map((company, index) => {
    const unlocked = isStationUnlocked(index);
    const complete = stationComplete(company.id);
    const donePieces = completedPieces(company.id);
    return `
      <article class="station ${unlocked ? "" : "locked"} ${complete ? "complete" : ""}" style="--station-accent:${company.accent}">
        <div class="station-head">
          <div>
            <span class="station-number">СТАНЦИЯ ${String(index + 1).padStart(2, "0")}</span>
            <h3>${company.short}</h3>
          </div>
          <span class="station-type">${company.type}</span>
        </div>
        <div class="puzzle-grid">
          ${pieceLabels.map((label, pieceIndex) => {
            const done = donePieces.includes(pieceIndex);
            const pieceUnlocked = unlocked && (pieceIndex === 0 || donePieces.includes(pieceIndex - 1) || done);
            return `
              <button class="puzzle-piece ${done ? "done" : ""}" 
                data-company="${company.id}" data-piece="${pieceIndex}" ${pieceUnlocked ? "" : "disabled"}>
                <span class="piece-icon">${done ? "OK" : `0${pieceIndex + 1}`}</span>
                <span class="piece-label">${label}</span>
              </button>
            `;
          }).join("")}
        </div>
        <div class="station-footer">
          <span>${unlocked ? complete ? "СТАНЦИЯ ПРОЙДЕНА" : "ДОСТУПНО СЕЙЧАС" : "ЗАБЛОКИРОВАНО"}</span>
          <b>${donePieces.length}/4</b>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".puzzle-piece:not(:disabled)").forEach(button => {
    button.addEventListener("click", () => openCompanyPiece(button.dataset.company, Number(button.dataset.piece)));
  });
}

function getMission() {
  if (!state.profile) {
    return { title: "Создай профиль", text: "Укажи имя и категорию участника, чтобы сохранить прогресс.", button: "Создать профиль", action: openRegistration };
  }
  if (!state.track) {
    return { title: "Пройди диагностику", text: "7 коротких ситуаций определят персональный трек.", button: "Начать тест", action: startTest };
  }
  const next = companies.find((company, index) => isStationUnlocked(index) && !stationComplete(company.id));
  if (next) {
    return { title: `Открой станцию «${next.short}»`, text: "Пройди четыре части пазла и получи баллы.", button: "Продолжить", action: () => openCompanyPiece(next.id, completedPieces(next.id).length) };
  }
  return { title: "Маршрут завершён", text: "Твоя итоговая траектория уже собрана в профиле.", button: "Смотреть итог", action: () => showScreen("profile") };
}

function renderMarket() {
  document.getElementById("marketBalance").textContent = state.score;
  document.getElementById("marketGrid").innerHTML = rewards.map(reward => {
    const claimed = state.rewards.includes(reward.id);
    return `
      <article class="reward-card" style="--reward-color:${reward.color}">
        <div class="reward-art">${reward.art}</div>
        <h3>${reward.title}</h3>
        <p>${reward.description}</p>
        <div class="reward-footer">
          <span class="reward-price"><span class="coin"></span>${reward.price}</span>
          <button class="button button-primary compact reward-button" data-reward="${reward.id}" ${claimed ? "disabled" : ""}>
            ${claimed ? "Получено" : "Обменять"}
          </button>
        </div>
      </article>
    `;
  }).join("");
  document.querySelectorAll(".reward-button:not(:disabled)").forEach(button => {
    button.addEventListener("click", () => claimReward(button.dataset.reward));
  });
}

function renderProfile() {
  const completed = completedStationCount();
  document.getElementById("profileFullName").textContent = state.profile?.name || "Гость маршрута";
  document.getElementById("profileRole").textContent = state.profile ? `${state.profile.category} · ${state.profile.email}` : "Создай профиль, чтобы начать";
  document.getElementById("profileTrack").textContent = state.track ? trackTitle(state.track) : "Пока не определён";
  document.getElementById("profileTrackDescription").textContent = state.track
    ? getFinalDescription()
    : "Пройди диагностику, и здесь появится твоя персональная рекомендация.";
  document.getElementById("profileScore").textContent = state.score;
  document.getElementById("profileStations").textContent = `${completed}/${companies.length}`;
  document.getElementById("profileTours").textContent = state.tours.length;
  document.getElementById("levelProgress").style.width = `${state.score % 100}%`;
  applyAvatar(document.getElementById("profileAvatar"));

  const action = document.getElementById("profileAction");
  if (!state.profile) {
    action.textContent = "Создать профиль";
    action.onclick = openRegistration;
  } else if (!state.track) {
    action.textContent = "Пройти диагностику";
    action.onclick = startTest;
  } else if (completed === companies.length) {
    action.textContent = "Открыть итоговую карту";
    action.onclick = openFinalResult;
  } else {
    action.textContent = "Продолжить маршрут";
    action.onclick = () => showScreen("route");
  }

  const achievements = [
    { code: "ID", name: "Участник", unlocked: Boolean(state.profile) },
    { code: "AI", name: "Трек найден", unlocked: Boolean(state.track) },
    { code: "3D", name: "Образ собран", unlocked: Boolean(state.profile) && Boolean(state.track) },
    { code: "01", name: "Первая станция", unlocked: completed >= 1 },
    { code: "03", name: "Экватор пути", unlocked: completed >= 3 },
    { code: "GO", name: "Финалист", unlocked: completed >= companies.length }
  ];
  document.getElementById("achievementRow").innerHTML = achievements.map(item => `
    <div class="achievement ${item.unlocked ? "" : "locked"}">
      <i>${item.code}</i><b>${item.name}</b>
    </div>
  `).join("");
}

function getFinalDescription() {
  if (completedStationCount() < companies.length) {
    return state.track === "business"
      ? "Твой профиль показывает склонность к запуску проектов. Проходи станции, чтобы собрать идею продукта для промышленности."
      : "Твой профиль показывает потенциал для профессионального роста в сильной команде. Проходи станции, чтобы собрать карьерную карту.";
  }
  return state.track === "business"
    ? "Итог маршрута: сервис предиктивного контроля оборудования для региональных производств. Начни с интервью с инженерами ЛЕПСЕ и прототипа панели мониторинга."
    : "Итог маршрута: инженер по автоматизации производства. Рекомендуемый путь — профильный колледж или вуз, учебные проекты по электронике и стажировка на предприятии.";
}

function openModal(content) {
  document.getElementById("modal").innerHTML = content;
  const backdrop = document.getElementById("modalBackdrop");
  backdrop.classList.add("open");
  backdrop.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.querySelector(".close-button")?.addEventListener("click", closeModal);
}

function closeModal() {
  document.getElementById("modalBackdrop").classList.remove("open");
  document.getElementById("modalBackdrop").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function modalFrame(kicker, title, body) {
  return `
    <div class="modal-head">
      <div><small>${kicker}</small><h2 id="modalTitle">${title}</h2></div>
      <button class="close-button" aria-label="Закрыть">X</button>
    </div>
    <div class="modal-body">${body}</div>
  `;
}

function openRegistration() {
  openModal(modalFrame("ШАГ 01", "Создай профиль", `
    <p class="modal-copy">Для демо данные сохраняются только в этом браузере и никуда не отправляются.</p>
    <form id="registrationForm">
      <div class="form-grid">
        <div class="field full">
          <label for="nameInput">Имя и фамилия</label>
          <input id="nameInput" name="name" required minlength="2" value="${state.profile?.name || ""}" placeholder="Например, Анна Петрова">
        </div>
        <div class="field">
          <label for="emailInput">Email</label>
          <input id="emailInput" name="email" type="email" required value="${state.profile?.email || ""}" placeholder="student@example.ru">
        </div>
        <div class="field">
          <label for="categoryInput">Категория</label>
          <select id="categoryInput" name="category" required>
            <option value="Школьник">Школьник</option>
            <option value="Студент колледжа">Студент колледжа</option>
            <option value="Студент вуза">Студент вуза</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="button button-ghost" id="cancelRegistration">Отмена</button>
        <button type="submit" class="button button-primary">Продолжить →</button>
      </div>
    </form>
  `));
  document.getElementById("cancelRegistration").onclick = closeModal;
  document.getElementById("registrationForm").onsubmit = event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.profile = { name: form.get("name").trim(), email: form.get("email").trim(), category: form.get("category") };
    saveState();
    renderAll();
    closeModal();
    showToast("Профиль создан. Теперь определим твой трек.");
    setTimeout(startTest, 220);
  };
}

function startTest() {
  if (!state.profile) {
    openRegistration();
    return;
  }
  activeQuestion = 0;
  temporaryAnswers = [];
  renderQuestion();
}

function renderQuestion() {
  const question = questions[activeQuestion];
  openModal(modalFrame("AI-ДИАГНОСТИКА", "Найди свой трек", `
    <div class="question-progress"><b style="width:${(activeQuestion + 1) / questions.length * 100}%"></b></div>
    <span class="question-number">ВОПРОС ${String(activeQuestion + 1).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}</span>
    <h3 class="question-title">${question.text}</h3>
    <div class="answer-list">
      ${question.answers.map((answer, index) => `
        <button class="answer" data-answer="${index}">
          <span class="answer-code">${String.fromCharCode(65 + index)}</span>
          <span>${answer.text}</span>
        </button>
      `).join("")}
    </div>
  `));
  document.querySelectorAll(".answer").forEach(button => {
    button.onclick = () => {
      const answer = question.answers[Number(button.dataset.answer)];
      temporaryAnswers.push(answer);
      if (activeQuestion < questions.length - 1) {
        activeQuestion += 1;
        renderQuestion();
      } else {
        finishTest();
      }
    };
  });
}

function finishTest() {
  const total = temporaryAnswers.reduce((sum, answer) => sum + answer.score, 0);
  state.track = total >= 1 ? "business" : "career";
  state.answers = temporaryAnswers.map(answer => answer.score);
  const skills = { initiative: 30, analytics: 30, team: 30 };
  temporaryAnswers.forEach(answer => {
    skills[answer.skill] += 10;
  });
  state.skills = skills;
  state.score += 40;
  saveState();
  renderAll();

  const business = state.track === "business";
  openModal(modalFrame("РЕЗУЛЬТАТ ДИАГНОСТИКИ", business ? "Трек: свой проект" : "Трек: карьера в индустрии", `
    <div class="result-card">
      <h3>${business ? "Технологический предприниматель" : "Промышленный специалист"}</h3>
      <p>${business
        ? "Ты готов брать инициативу, проверять гипотезы и собирать людей вокруг идеи. Маршрут покажет, какие задачи предприятий можно превратить в продукт."
        : "Тебе подходит развитие в сильной команде, глубокая экспертиза и понятный профессиональный рост. Маршрут поможет выбрать отрасль и специальность."}</p>
      <div class="result-tags">
        <span>ИНИЦИАТИВА ${skills.initiative}%</span>
        <span>АНАЛИТИКА ${skills.analytics}%</span>
        <span>КОМАНДА ${skills.team}%</span>
      </div>
    </div>
    <div class="modal-actions">
      <button class="button button-primary" id="createAvatarAfterTest">Создать аватар →</button>
    </div>
  `));
  document.getElementById("createAvatarAfterTest").onclick = openAvatarBuilder;
}

function openAvatarBuilder() {
  const draft = { ...state.avatar };
  openModal(modalFrame("ШАГ 03", "Собери своего героя", `
    <div class="avatar-builder">
      <div class="avatar-preview"><span class="large-avatar" id="builderAvatar"></span></div>
      <div class="avatar-options">
        ${swatchGroup("Тон кожи", "skin", ["#f6d0b1", "#f0b38f", "#c9825b", "#79462f"], draft.skin)}
        ${swatchGroup("Волосы", "hair", ["#171717", "#37251c", "#8c5a2b", "#e2c477"], draft.hair)}
        ${swatchGroup("Экипировка", "suit", ["#536dfe", "#ff6f61", "#5ce1b9", "#ffd629"], draft.suit)}
      </div>
    </div>
    <div class="modal-actions">
      <button class="button button-ghost" id="randomAvatar">Случайный образ</button>
      <button class="button button-primary" id="saveAvatar">Сохранить героя →</button>
    </div>
  `));

  const preview = document.getElementById("builderAvatar");
  applyAvatar(preview, draft);
  document.querySelectorAll(".swatch").forEach(button => {
    button.onclick = () => {
      const type = button.dataset.type;
      draft[type] = button.dataset.value;
      document.querySelectorAll(`.swatch[data-type="${type}"]`).forEach(item => item.classList.toggle("active", item === button));
      applyAvatar(preview, draft);
    };
  });
  document.getElementById("randomAvatar").onclick = () => {
    const random = list => list[Math.floor(Math.random() * list.length)];
    draft.skin = random(["#f6d0b1", "#f0b38f", "#c9825b", "#79462f"]);
    draft.hair = random(["#171717", "#37251c", "#8c5a2b", "#e2c477"]);
    draft.suit = random(["#536dfe", "#ff6f61", "#5ce1b9", "#ffd629"]);
    applyAvatar(preview, draft);
    document.querySelectorAll(".swatch").forEach(item => item.classList.toggle("active", draft[item.dataset.type] === item.dataset.value));
  };
  document.getElementById("saveAvatar").onclick = () => {
    state.avatar = draft;
    if (!state.avatarCreated) {
      state.score += 25;
      state.avatarCreated = true;
    }
    saveState();
    renderAll();
    closeModal();
    showToast("+25 энергии. Первая станция открыта.");
    showScreen("route");
  };
}

function swatchGroup(label, type, values, current) {
  return `
    <div class="option-group">
      <label>${label}</label>
      <div class="swatches">
        ${values.map(value => `<button class="swatch ${value === current ? "active" : ""}" data-type="${type}" data-value="${value}" style="--swatch:${value}" aria-label="${label}"></button>`).join("")}
      </div>
    </div>
  `;
}

function openCompanyPiece(companyId, pieceIndex) {
  const company = companies.find(item => item.id === companyId);
  const index = companies.findIndex(item => item.id === companyId);
  if (!isStationUnlocked(index)) return;
  activeStation = companyId;
  activePiece = pieceIndex;

  if (company.id === "final" && pieceIndex === 2) {
    openGamePlaceholder(company);
    return;
  }

  const contents = [
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
      visual: `Карьера начинается со знакомства с реальными задачами`,
      facts: company.careers,
      task: "Какой навык особенно важен для этих профессий?",
      options: ["Умение учиться и работать в команде", "Умение избегать новых задач"]
    },
    {
      title: state.track === "business" ? "Твой бизнес-ход" : "Твой карьерный ход",
      visual: state.track === "business" ? "Найди точку роста для предприятия" : "Выбери роль на предприятии",
      facts: state.track === "business"
        ? ["Предложи сервис или продукт, который решает одну из задач производства.", `Потенциальные партнёры: ${company.partners.join(", ")}.`]
        : ["Выбери профессиональную роль и первый шаг к ней.", `Возможные партнёры обучения: ${company.partners.join(", ")}.`],
      task: state.track === "business" ? "Как хочешь взаимодействовать с предприятием?" : "Как хочешь взаимодействовать с предприятием?",
      options: ["Как предприниматель-партнёр", "Как сотрудник команды"]
    }
  ][pieceIndex];

  const alreadyDone = completedPieces(companyId).includes(pieceIndex);
  openModal(modalFrame(`СТАНЦИЯ ${String(index + 1).padStart(2, "0")} · БЛОК ${pieceIndex + 1}/4`, contents.title, `
    <div class="content-visual" style="background:linear-gradient(to top, rgba(9,11,19,.94), transparent), linear-gradient(135deg, ${company.accent}, #191e2d)">
      <b>${contents.visual}</b>
    </div>
    <div class="fact-list">${contents.facts.map(fact => `<div>${fact}</div>`).join("")}</div>
    <div class="task-box">
      <b>МИНИ-ЗАДАНИЕ</b>
      <p>${contents.task}</p>
      <div class="binary-options">
        ${contents.options.map((option, optionIndex) => `<button data-choice="${optionIndex}">${option}</button>`).join("")}
      </div>
    </div>
    <div class="modal-actions">
      <button class="button button-primary" id="completePiece" ${alreadyDone ? "" : "disabled"}>
        ${alreadyDone ? "Посмотреть карту" : "Выбери ответ"}
      </button>
    </div>
  `));

  let selected = null;
  document.querySelectorAll("[data-choice]").forEach(button => {
    button.onclick = () => {
      selected = Number(button.dataset.choice);
      document.querySelectorAll("[data-choice]").forEach(item => item.classList.toggle("selected", item === button));
      const completeButton = document.getElementById("completePiece");
      completeButton.disabled = false;
      completeButton.textContent = alreadyDone ? "Посмотреть карту" : "Завершить блок +20";
    };
  });
  document.getElementById("completePiece").onclick = () => {
    if (!alreadyDone && selected === null) return;
    completePiece(companyId, pieceIndex, selected);
  };
}

function completePiece(companyId, pieceIndex, selected) {
  const progress = state.completed[companyId] || { pieces: [], choice: null };
  const wasDone = progress.pieces.includes(pieceIndex);
  if (!wasDone) {
    progress.pieces.push(pieceIndex);
    progress.pieces.sort();
    if (pieceIndex === 3) progress.choice = selected === 0 ? "business" : "career";
    state.completed[companyId] = progress;
    state.score += pieceIndex === 3 ? 35 : 20;
    const skillKeys = ["analytics", "initiative", "team", "initiative"];
    state.skills[skillKeys[pieceIndex]] = Math.min(100, state.skills[skillKeys[pieceIndex]] + 5);
  }
  saveState();
  renderAll();
  closeModal();

  if (!wasDone && pieceIndex === 3 && companyId !== "final") {
    showStationComplete(companyId);
  } else if (!wasDone && companyId === "final" && pieceIndex === 3) {
    openFinalResult();
  } else {
    showToast(wasDone ? "Возвращаемся на карту." : `Блок пройден. +${pieceIndex === 3 ? 35 : 20} энергии.`);
  }
}

function showStationComplete(companyId) {
  const company = companies.find(item => item.id === companyId);
  openModal(modalFrame("СТАНЦИЯ ПРОЙДЕНА", `${company.short}: миссия выполнена`, `
    <div class="result-card">
      <h3>+95 энергии за станцию</h3>
      <p>Все четыре части пазла собраны. Следующая станция маршрута разблокирована.</p>
    </div>
    <div class="modal-actions">
      <button class="button button-ghost" id="tourButton">Записаться на экскурсию</button>
      <button class="button button-primary" id="nextButton">К следующей станции →</button>
    </div>
  `));
  document.getElementById("tourButton").onclick = () => openTourForm(companyId);
  document.getElementById("nextButton").onclick = closeModal;
}

function openTourForm(companyId) {
  const company = companies.find(item => item.id === companyId);
  openModal(modalFrame("ЗАЯВКА НА ЭКСКУРСИЮ", company.short, `
    <p class="modal-copy">Это демонстрационная форма. Заявка сохранится локально и не будет отправлена.</p>
    <form id="tourForm">
      <div class="form-grid">
        <div class="field">
          <label>Дата</label>
          <input type="date" name="date" required>
        </div>
        <div class="field">
          <label>Телефон</label>
          <input type="tel" name="phone" required placeholder="+7 900 000-00-00">
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="button button-ghost" id="cancelTour">Назад</button>
        <button class="button button-primary" type="submit">Сохранить заявку</button>
      </div>
    </form>
  `));
  document.getElementById("cancelTour").onclick = () => showStationComplete(companyId);
  document.getElementById("tourForm").onsubmit = event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.tours.push({ companyId, date: form.get("date"), phone: form.get("phone") });
    state.score += 15;
    saveState();
    renderAll();
    closeModal();
    showToast("Заявка сохранена в профиле. +15 энергии.");
  };
}

function openGamePlaceholder(company) {
  const done = completedPieces(company.id).includes(2);
  openModal(modalFrame("ИГРОВОЙ МОДУЛЬ · ДЕМО", "Симулятор производства", `
    <div class="placeholder-game">
      <div class="game-machine">
        <small>МОДУЛЬ В РАЗРАБОТКЕ</small>
        <h3>СОБЕРИ ЛИНИЮ</h3>
        <div class="game-screen"><span></span><span></span><span></span><span></span></div>
        <p>В полной версии здесь будет короткая игра по управлению производственным процессом. В MVP модуль работает как заглушка.</p>
      </div>
    </div>
    <div class="modal-actions">
      <button class="button button-primary" id="finishPlaceholder">${done ? "Вернуться на карту" : "Засчитать демо +20"}</button>
    </div>
  `));
  document.getElementById("finishPlaceholder").onclick = () => completePiece(company.id, 2, 0);
}

function openFinalResult() {
  const business = state.track === "business";
  openModal(modalFrame("ФИНАЛ МАРШРУТА", business ? "Идея твоего бизнес-проекта" : "Твоя карьерная траектория", `
    <div class="result-card">
      <h3>${business ? "«Цех.Сигнал»" : "Инженер по автоматизации"}</h3>
      <p>${business
        ? "Сервис предиктивного контроля оборудования для региональных производств: датчики собирают данные, а понятная панель заранее показывает риск простоя."
        : "Специалист, который проектирует, настраивает и улучшает автоматические производственные линии. Подходит твоему сочетанию аналитики и командности."}</p>
      <div class="result-tags">
        ${business
          ? "<span>КЛИЕНТЫ: ЗАВОДЫ</span><span>ПРОТОТИП: ДАШБОРД</span><span>ПЕРВЫЙ ШАГ: 5 ИНТЕРВЬЮ</span>"
          : "<span>ОБУЧЕНИЕ: АВТОМАТИЗАЦИЯ</span><span>ПРАКТИКА: ПЛК + ЭЛЕКТРОНИКА</span><span>СТАРТ: СТАЖИРОВКА</span>"}
      </div>
    </div>
    <div class="fact-list">
      <div><b>01.</b> ${business ? "Поговори с инженерами о самых дорогих простоях." : "Выбери программу колледжа или вуза по автоматизации."}</div>
      <div><b>02.</b> ${business ? "Собери кликабельный прототип панели мониторинга." : "Собери учебный стенд на Arduino или ПЛК."}</div>
      <div><b>03.</b> ${business ? "Проверь решение на одном типе оборудования." : "Подай заявку на экскурсию и стажировку."}</div>
    </div>
    <div class="modal-actions">
      <button class="button button-ghost" id="openMarketResult">Открыть маркет</button>
      <button class="button button-primary" id="openProfileResult">В моё портфолио →</button>
    </div>
  `));
  document.getElementById("openMarketResult").onclick = () => { closeModal(); showScreen("market"); };
  document.getElementById("openProfileResult").onclick = () => { closeModal(); showScreen("profile"); };
}

function claimReward(rewardId) {
  const reward = rewards.find(item => item.id === rewardId);
  if (state.score < reward.price) {
    showToast(`Нужно ещё ${reward.price - state.score} энергии.`);
    return;
  }
  state.score -= reward.price;
  state.rewards.push(rewardId);
  saveState();
  renderAll();
  showToast(`Награда «${reward.title}» добавлена в профиль.`);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function renderAll() {
  renderHeader();
  renderMiniRoute();
  renderRoute();
  renderMarket();
  renderProfile();
}

document.querySelectorAll("[data-nav]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    showScreen(button.dataset.nav);
  });
});

document.getElementById("startButton").onclick = () => {
  if (!state.profile) openRegistration();
  else if (!state.track) startTest();
  else showScreen("route");
};
document.getElementById("profileButton").onclick = () => showScreen("profile");
document.getElementById("menuButton").onclick = () => document.querySelector(".main-nav").classList.toggle("open");
document.getElementById("editAvatarButton").onclick = () => state.profile ? openAvatarBuilder() : openRegistration();
document.getElementById("modalBackdrop").addEventListener("click", event => {
  if (event.target.id === "modalBackdrop") closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

renderAll();
