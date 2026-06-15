import { initDb, getDb, closeDb } from "./connection.js";
import { hashPassword } from "../utils/hash.js";
import { config } from "dotenv";

config({ path: new URL("../.env", import.meta.url).pathname });

async function seed() {
  await initDb();
  const db = getDb();

  // Check if data exists
  const companyCount = db.prepare("SELECT COUNT(*) as c FROM companies").get();
  if (companyCount && companyCount.c > 0) {
    console.log("[seed] Данные уже есть. Пропускаем.");
    closeDb();
    return;
  }

  console.log("[seed] Начинаем сидирование...");

  // 1. Companies (6)
  const insertCompany = db.prepare(`
    INSERT INTO companies (id, name, short, type, accent, history, products, careers, partners, game_profession, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const companies = [
    { id: "leps", name: "Электромашиностроительный завод ЛЕПСЕ", short: "ЛЕПСЕ", type: "Авиация и электротехника", accent: "#536dfe",
      history: "Одно из ключевых предприятий региона, выпускающее электрические машины и оборудование для авиационной промышленности. Основано в 1941 году, сегодня ЛЕПСЕ — современный производственный комплекс, где трудятся более 2000 человек.",
      products: JSON.stringify(["Авиационные электродвигатели", "Электронасосные агрегаты", "Системы автоматики"]),
      careers: JSON.stringify(["Инженер-конструктор", "Технолог производства", "Оператор станков с ЧПУ"]),
      partners: JSON.stringify(["Авиастроительные компании", "Технические вузы", "Региональные колледжи"]),
      gameProfession: "energy", sort_order: 0 },
    { id: "mayak", name: "Кировский машзавод 1 Мая", short: "1 МАЯ", type: "Транспортное машиностроение", accent: "#ff6f61",
      history: "Предприятие создаёт сложную железнодорожную технику и машины для обслуживания транспортной инфраструктуры. Завод основан в 1900 году и прошёл путь от ремонтных мастерских до высокотехнологичного производства.",
      products: JSON.stringify(["Путевые машины", "Подъёмное оборудование", "Специальные платформы"]),
      careers: JSON.stringify(["Инженер-механик", "Сварщик", "Специалист по качеству"]),
      partners: JSON.stringify(["Российские железные дороги", "Машиностроительные холдинги", "Учебные центры"]),
      gameProfession: "foreman", sort_order: 1 },
    { id: "vmp", name: "Вятское машиностроительное предприятие", short: "ВМП", type: "Промышленное оборудование", accent: "#5ce1b9",
      history: "Современная производственная площадка, где инженерные решения превращаются в оборудование для разных отраслей. ВМП специализируется на нестандартном оборудовании и металлоконструкциях.",
      products: JSON.stringify(["Металлоконструкции", "Промышленные узлы", "Нестандартное оборудование"]),
      careers: JSON.stringify(["Проектировщик", "Мастер участка", "Инженер по автоматизации"]),
      partners: JSON.stringify(["Строительные компании", "Промышленные заказчики", "Инженерные бюро"]),
      gameProfession: null, sort_order: 2 },
    { id: "biohim", name: "Кировский биохимзавод", short: "БИОХИМ", type: "Биотехнологии", accent: "#b887ff",
      history: "Производственная площадка с глубокой экспертизой в химических и биотехнологических процессах. Завод выпускает продукцию, востребованную в фармацевтике, сельском хозяйстве и промышленности.",
      products: JSON.stringify(["Биохимические компоненты", "Технические спирты", "Продукты глубокой переработки"]),
      careers: JSON.stringify(["Химик-технолог", "Лаборант", "Инженер-эколог"]),
      partners: JSON.stringify(["Научные институты", "Химические компании", "Аграрный сектор"]),
      gameProfession: null, sort_order: 3 },
    { id: "kccm", name: "Кировский завод цветных металлов", short: "КЗЦМ", type: "Металлургия", accent: "#ff9d36",
      history: "Предприятие перерабатывает цветные металлы и создаёт продукцию, востребованную в высокотехнологичных отраслях. КЗЦМ — один из ведущих поставщиков проката цветных металлов в регионе.",
      products: JSON.stringify(["Прокат цветных металлов", "Сплавы", "Промышленные заготовки"]),
      careers: JSON.stringify(["Металлург", "Инженер по качеству", "Специалист по логистике"]),
      partners: JSON.stringify(["Промышленные холдинги", "Энергетические компании", "Исследовательские лаборатории"]),
      gameProfession: "inspector", sort_order: 4 },
    { id: "final", name: "Финальная лаборатория", short: "ФИНАЛ", type: "Персональная траектория", accent: "#ffd629",
      history: "Здесь все решения маршрута соединяются в персональный проект или карьерный план. Финальная лаборатория — это не просто станция, а итог всего пройденного пути.",
      products: JSON.stringify(["Идея проекта", "Карта обучения", "Портфолио навыков"]),
      careers: JSON.stringify(["Автор проекта", "Будущий специалист", "Участник стажировки"]),
      partners: JSON.stringify(["Предприятия маршрута", "Колледжи и вузы", "Центры занятости"]),
      gameProfession: null, sort_order: 5 },
  ];

  for (const c of companies) {
    insertCompany.run(c.id, c.name, c.short, c.type, c.accent, c.history, c.products, c.careers, c.partners, c.gameProfession, c.sort_order);
  }
  console.log("[seed] 6 companies inserted.");

  // 2. Station Pieces (36 records)
  const insertPiece = db.prepare(`
    INSERT INTO station_pieces (company_id, piece_index, track, title, visual, facts, task_question, options, correct_option_index, score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const companyIds = ["leps", "mayak", "vmp", "biohim", "kccm", "final"];

  for (const cid of companyIds) {
    const co = companies.find(c => c.id === cid);
    // Piece 0 — general history
    insertPiece.run(cid, 0, null,
      "История и масштаб",
      `${co.short}: предприятие, которое влияет на развитие региона`,
      JSON.stringify([co.history, "Контент в демо создан как пример и будет заменён материалами команды проекта."]),
      "Что важнее для устойчивого предприятия?",
      JSON.stringify(["Связь опыта и новых технологий", "Только размер производства"]),
      0, 20
    );
    // Piece 1 — business track
    insertPiece.run(cid, 1, "business",
      "Что здесь создают",
      `Продукты предприятия «${co.short}»`,
      co.products,
      "Какой продукт можно усилить цифровым сервисом?",
      JSON.stringify([JSON.parse(co.products)[0], JSON.parse(co.products)[1]]),
      null, 20
    );
    // Piece 1 — career track
    insertPiece.run(cid, 1, "career",
      "Что здесь создают",
      `Продукты предприятия «${co.short}»`,
      co.products,
      "Какой продукт тебе интереснее изучить изнутри?",
      JSON.stringify([JSON.parse(co.products)[0], JSON.parse(co.products)[1]]),
      null, 20
    );
    // Piece 2 — general careers
    insertPiece.run(cid, 2, null,
      "Люди и профессии",
      "Карьера начинается со знакомства с реальными задачами",
      co.careers,
      "Какой навык особенно важен для этих профессий?",
      JSON.stringify(["Умение учиться и работать в команде", "Умение избегать новых задач"]),
      0, 20
    );
    // Piece 3 — business track choice
    insertPiece.run(cid, 3, "business",
      "Твой бизнес-ход",
      "Найди точку роста для предприятия",
      JSON.stringify([`Предложи сервис или продукт, который решает одну из задач производства.`, `Потенциальные партнёры: ${JSON.parse(co.partners).join(", ")}.`]),
      "Как хочешь взаимодействовать с предприятием?",
      JSON.stringify(["Как предприниматель-партнёр", "Как сотрудник команды"]),
      null, 35
    );
    // Piece 3 — career track choice
    insertPiece.run(cid, 3, "career",
      "Твой карьерный ход",
      "Выбери роль на предприятии",
      JSON.stringify([`Выбери профессиональную роль и первый шаг к ней.`, `Возможные партнёры обучения: ${JSON.parse(co.partners).join(", ")}.`]),
      "Как хочешь взаимодействовать с предприятием?",
      JSON.stringify(["Как предприниматель-партнёр", "Как сотрудник команды"]),
      null, 35
    );
  }
  console.log("[seed] 36 station_pieces inserted.");

  // 3. Questions (7) + Question Answers (21)
  const insertQuestion = db.prepare(`INSERT INTO questions (sort_order, text) VALUES (?, ?)`);
  const insertAnswer = db.prepare(`INSERT INTO question_answers (question_id, sort_order, text, score, skill) VALUES (?, ?, ?, ?, ?)`);

  const questionData = [
    { text: "Какой результат общего проекта радует тебя больше?",
      answers: [
        { text: "Мы придумали новое решение и убедили других его попробовать", score: 2, skill: "initiative" },
        { text: "Мы сделали сложную работу качественно и точно в срок", score: -2, skill: "team" },
        { text: "Я разобрался, как всё устроено, и улучшил процесс", score: 0, skill: "analytics" }
      ] },
    { text: "Представь, у тебя есть свободные 20 000 рублей на полезный опыт. Что выберешь?",
      answers: [
        { text: "Соберу прототип продукта и проверю, нужен ли он людям", score: 2, skill: "initiative" },
        { text: "Пройду сильный курс и соберу портфолио для работодателя", score: -2, skill: "analytics" },
        { text: "Поеду на отраслевой форум и познакомлюсь с командами", score: 1, skill: "team" }
      ] },
    { text: "Что ты обычно делаешь, когда задача сформулирована неясно?",
      answers: [
        { text: "Сам определяю цель и начинаю проверять гипотезы", score: 2, skill: "initiative" },
        { text: "Уточняю критерии и согласую план с наставником", score: -1, skill: "team" },
        { text: "Собираю данные и раскладываю проблему на части", score: 0, skill: "analytics" }
      ] },
    { text: "Какую роль ты чаще выбираешь в команде?",
      answers: [
        { text: "Предлагаю направление и собираю людей вокруг идеи", score: 2, skill: "initiative" },
        { text: "Беру конкретный участок и становлюсь в нём экспертом", score: -2, skill: "analytics" },
        { text: "Слежу, чтобы все договорились и двигались вместе", score: -1, skill: "team" }
      ] },
    { text: "Как ты относишься к риску ошибиться?",
      answers: [
        { text: "Нормально, если ошибка быстрая и помогает проверить идею", score: 2, skill: "initiative" },
        { text: "Стараюсь заранее снизить риск расчётами и проверками", score: -1, skill: "analytics" },
        { text: "Предпочитаю опираться на опыт сильной команды", score: -2, skill: "team" }
      ] },
    { text: "Какая промышленная задача кажется наиболее интересной?",
      answers: [
        { text: "Найти новый продукт, который предприятие сможет продавать", score: 2, skill: "initiative" },
        { text: "Освоить современное оборудование и стать сильным специалистом", score: -2, skill: "analytics" },
        { text: "Организовать процесс так, чтобы команда работала эффективнее", score: 0, skill: "team" }
      ] },
    { text: "Где ты хотел бы оказаться через пять лет?",
      answers: [
        { text: "Запускаю собственный технологический проект", score: 3, skill: "initiative" },
        { text: "Работаю в сильной компании и расту как профессионал", score: -3, skill: "analytics" },
        { text: "Пока хочу попробовать оба варианта на практике", score: 0, skill: "team" }
      ] }
  ];

  for (let i = 0; i < questionData.length; i++) {
    const q = questionData[i];
    insertQuestion.run(i, q.text);
    // Get the actual inserted ID by querying back
    const qRow = db.prepare("SELECT id FROM questions WHERE sort_order = ? AND text = ?").get(i, q.text);
    const qId = qRow ? qRow.id : (i + 1);
    for (let j = 0; j < q.answers.length; j++) {
      const a = q.answers[j];
      insertAnswer.run(qId, j, a.text, a.score, a.skill);
    }
  }
  console.log("[seed] 7 questions + 21 answers inserted.");

  // 4. Achievements (14)
  const insertAchievement = db.prepare(`
    INSERT INTO achievements (id, name, icon, description, condition_key, is_game)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const achievementData = [
    { id: "member", name: "Участник", icon: "ID", desc: "Профиль создан", condition: "hasProfile", game: 0 },
    { id: "track_found", name: "Трек найден", icon: "AI", desc: "Диагностика пройдена", condition: "hasTrack", game: 0 },
    { id: "avatar_built", name: "Образ собран", icon: "3D", desc: "Аватар создан", condition: "hasAvatar", game: 0 },
    { id: "first_station", name: "Первая станция", icon: "01", desc: "Одна станция пройдена", condition: "stationsCompleted >= 1", game: 0 },
    { id: "equator", name: "Экватор пути", icon: "03", desc: "Три станции пройдены", condition: "stationsCompleted >= 3", game: 0 },
    { id: "finalist", name: "Финалист", icon: "GO", desc: "Все станции пройдены", condition: "stationsCompleted >= 6", game: 0 },
    { id: "quick_solver", name: "Быстрый решатель", icon: "⚡", desc: "Задача выполнена за <30 сек", condition: "anyTaskUnder30s", game: 1 },
    { id: "perfectionist", name: "Перфекционист", icon: "💎", desc: "Все задачи верны с первой попытки", condition: "allTasksPerfect", game: 1 },
    { id: "found_solution", name: "Нашёл решение", icon: "🔧", desc: "Правильный вариант в задаче 3 (Прораб)", condition: "foremanTask3Correct", game: 1 },
    { id: "responsible", name: "Ответственный диспетчер", icon: "📊", desc: "Правильные приоритеты (Энергетик)", condition: "engineerTask2Correct", game: 1 },
    { id: "ethical", name: "Этичный работник", icon: "🤝", desc: "Ни одного нечестного выбора", condition: "noBadChoices", game: 1 },
    { id: "honest_inspector", name: "Честный инспектор", icon: "🔬", desc: "Отказ подписать акт (Инженер КК)", condition: "inspectorTask3Refused", game: 1 },
    { id: "master_builder", name: "Мастер строительной отрасли", icon: "🏆", desc: "Пройдены все 3 игровые профессии", condition: "allGameProfessions", game: 1 },
  ];

  for (const a of achievementData) {
    insertAchievement.run(a.id, a.name, a.icon, a.desc, a.condition, a.game);
  }
  console.log("[seed] 13 achievements inserted.");

  // 5. Final Results (2)
  const insertFinalResult = db.prepare(`
    INSERT INTO final_results (track, title, project_name, description, tags, steps)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertFinalResult.run("business",
    "Идея твоего бизнес-проекта",
    "«Цех.Сигнал»",
    "Сервис предиктивного контроля оборудования для региональных производств: датчики собирают данные, а понятная панель заранее показывает риск простоя.",
    JSON.stringify(["КЛИЕНТЫ: ЗАВОДЫ", "ПРОТОТИП: ДАШБОРД", "ПЕРВЫЙ ШАГ: 5 ИНТЕРВЬЮ"]),
    JSON.stringify(["Поговори с инженерами о самых дорогих простоях.", "Собери кликабельный прототип панели мониторинга.", "Проверь решение на одном типе оборудования."])
  );
  insertFinalResult.run("career",
    "Твоя карьерная траектория",
    "Инженер по автоматизации",
    "Специалист, который проектирует, настраивает и улучшает автоматические производственные линии. Подходит твоему сочетанию аналитики и командности.",
    JSON.stringify(["ОБУЧЕНИЕ: АВТОМАТИЗАЦИЯ", "ПРАКТИКА: ПЛК + ЭЛЕКТРОНИКА", "СТАРТ: СТАЖИРОВКА"]),
    JSON.stringify(["Выбери программу колледжа или вуза по автоматизации.", "Собери учебный стенд на Arduino или ПЛК.", "Подай заявку на экскурсию и стажировку."])
  );
  console.log("[seed] 2 final_results inserted.");

  // 6. Tasks (9) + Task Options
  const insertTask = db.prepare(`
    INSERT INTO tasks (company_id, profession, task_number, title, description, task_type, max_score, config_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTaskOption = db.prepare(`
    INSERT INTO task_options (task_id, sort_order, text, is_correct, option_key) VALUES (?, ?, ?, ?, ?)
  `);

  const taskData = [
    { company: "mayak", prof: "foreman", num: 1, title: "Приёмка материалов", desc: "По накладной пришло 520 шт кирпича вместо заказанных 500. Что будешь делать?", type: "invoice", maxScore: 10, config: "{}", options: [] },
    { company: "mayak", prof: "foreman", num: 2, title: "Распределение бригад", desc: "Перетащите рабочих в нужные зоны строительства", type: "dragdrop", maxScore: 15, config: "{}", options: [] },
    { company: "mayak", prof: "foreman", num: 3, title: "Авария: закончились анкерные болты", desc: "На площадке закончились анкерные болты. Работа стоит.", type: "choice", maxScore: 20, config: JSON.stringify({ emergency: true }),
      options: [
        { text: "Отправить подсобника на склад", correct: 1 },
        { text: "Ждать, пока само решится", correct: 0 },
        { text: "Использовать обычные болты", correct: 0 },
      ] },
    { company: "leps", prof: "energy", num: 1, title: "Снижение перегрузки ПС №2", desc: "Подстанция №2 перегружена на 78%. Нужно переключить часть нагрузки.", type: "choice", maxScore: 10, config: "{}",
      options: [
        { text: "Переключить 15% нагрузки на ПС №3", correct: 1 },
        { text: "Оставить как есть", correct: 0 },
        { text: "Отключить всех потребителей", correct: 0 },
      ] },
    { company: "leps", prof: "energy", num: 2, title: "Распределение резерва 50 МВт", desc: "Выбери приоритетных потребителей для оставшихся 50 МВт.", type: "checkbox", maxScore: 15, config: "{}",
      options: [
        { text: "Завод (35 МВт)", correct: 0, key: "factory" },
        { text: "Больница (10 МВт)", correct: 1, key: "hospital" },
        { text: "Жилой район (15 МВт)", correct: 1, key: "residential" },
      ] },
    { company: "leps", prof: "energy", num: 3, title: "Авария: обрыв ЛЭП", desc: "Произошёл обрыв линии электропередачи.", type: "choice", maxScore: 20, config: JSON.stringify({ emergency: true }),
      options: [
        { text: "Отключить всё, пока чинят", correct: 0 },
        { text: "Отключить хлебозавод, дать свет в дома и школу", correct: 1 },
        { text: "Дать свет хлебозаводу, отключить дома", correct: 0 },
      ] },
    { company: "kccm", prof: "inspector", num: 1, title: "Осмотр стены", desc: "Кликайте по стене — ищите трещины, широкие швы, вздутия", type: "inspection", maxScore: 10, config: "{}", options: [] },
    { company: "kccm", prof: "inspector", num: 2, title: "Проверка документации", desc: "Сравни акт бригады с нормативом СНиП. Найди 3 ошибки.", type: "doccheck", maxScore: 15, config: "{}", options: [] },
    { company: "kccm", prof: "inspector", num: 3, title: "Звонок заказчика", desc: "Директор звонит и давит подписать акт приёмки раньше срока.", type: "choice", maxScore: 20, config: "{}",
      options: [
        { text: "Подписать — директору виднее", correct: 0 },
        { text: "Отказать — провести полную проверку", correct: 1 },
        { text: "Подписать задним числом", correct: 0 },
      ] },
  ];

  for (const t of taskData) {
    const result = insertTask.run(t.company, t.prof, t.num, t.title, t.desc, t.type, t.maxScore, t.config);
    for (let j = 0; j < t.options.length; j++) {
      const opt = t.options[j];
      insertTaskOption.run(result.lastInsertRowid, j, opt.text, opt.correct, opt.key || null);
    }
  }
  console.log("[seed] 9 tasks + task_options inserted.");

  // 7. Game Workers (5)
  const insertWorker = db.prepare(`INSERT INTO game_workers (id, name, role, color, correct_zone) VALUES (?, ?, ?, ?, ?)`);
  insertWorker.run(0, "Пётр", "каменщик", "#3366cc", "foundation");
  insertWorker.run(1, "Василий", "подсобник", "#33aa55", "foundation");
  insertWorker.run(2, "Николай", "каменщик", "#3366cc", "walls");
  insertWorker.run(3, "Ольга", "сварщик", "#8844aa", "walls");
  insertWorker.run(4, "Евгений", "водитель", "#cc6633", "walls");
  console.log("[seed] 5 game_workers inserted.");

  // 8. Game Doc Rows (6)
  const insertDocRow = db.prepare(`INSERT INTO game_doc_rows (row_index, act_text, norm_text, is_error) VALUES (?, ?, ?, ?)`);
  insertDocRow.run(0, "Диаметр арматуры: 10 мм", "Диаметр арматуры: 12 мм", 1);
  insertDocRow.run(1, "Шаг армирования: 200 мм", "Шаг армирования: 200 мм ✓", 0);
  insertDocRow.run(2, "Марка бетона: М200", "Марка бетона: М300", 1);
  insertDocRow.run(3, "Глубина залегания: 1.2 м", "Глубина залегания: 1.2 м ✓", 0);
  insertDocRow.run(4, "Подпись прораба: есть", "Подпись прораба: обяз. ✓", 0);
  insertDocRow.run(5, "Подпись КК: —", "Подпись КК: обязательна", 1);
  console.log("[seed] 6 game_doc_rows inserted.");

  // 9. Scoring Config (3)
  const insertScoring = db.prepare(`INSERT INTO scoring_config (task_number, base_score, bonus_threshold_ms, bonus_points) VALUES (?, ?, ?, ?)`);
  insertScoring.run(1, 10, 20000, 3);
  insertScoring.run(2, 15, 45000, 5);
  insertScoring.run(3, 20, 15000, 2);
  console.log("[seed] 3 scoring_config inserted.");

  // 10. Level Thresholds (4)
  const insertLevel = db.prepare(`INSERT INTO level_thresholds (level_name, min_score, sort_order) VALUES (?, ?, ?)`);
  insertLevel.run("новичок", 0, 0);
  insertLevel.run("стажёр", 100, 1);
  insertLevel.run("мастер", 250, 2);
  insertLevel.run("эксперт", 450, 3);
  console.log("[seed] 4 level_thresholds inserted.");

  // 11. Admin user (from .env)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@marshrutka.ru";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminHash = await hashPassword(adminPassword);
  const insertAdmin = db.prepare(`INSERT INTO users (name, email, password_hash, category, role) VALUES (?, ?, ?, ?, ?)`);
  try {
    insertAdmin.run("Администратор", adminEmail, adminHash, "Администратор", "admin");
    console.log(`[seed] Admin user created: ${adminEmail}`);
  } catch (e) {
    console.log(`[seed] Admin user skipped: ${e.message}`);
  }

  console.log("[seed] Сидирование завершено успешно.");
  closeDb();
}

seed().catch(err => {
  console.error("[seed] Ошибка:", err);
  process.exit(1);
});