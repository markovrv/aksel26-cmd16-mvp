# Проект бекенда «Маршрутка» v2.1

## 1. Технологический стек

| Компонент | Технология |
|-----------|-----------|
| Рантайм | Node.js ≥ 20 |
| Фреймворк | Express 5 |
| База данных | SQLite (better-sqlite3 — синхронный драйвер) |
| Аутентификация | bcrypt (хеш паролей) + JWT (access/refresh токены) |
| Валидация | express-validator |
| Миграции | Отдельный скрипт `server/db/migrate.js` |
| Сидирование | Скрипт `server/db/seed.js` — переносит ВСЕ захардкоженные данные из `client/src/` в БД |
| Логирование | console + файл через pino (опционально) |
| Переменные окружения | dotenv (`.env`) |

---

## 2. Структура каталогов `server/`

```
server/
├── index.js                    # Точка входа Express
├── package.json
├── .env
├── .env.example
├── db/
│   ├── connection.js           # Подключение к SQLite (better-sqlite3)
│   ├── migrate.js              # Создание таблиц (idempotent)
│   ├── seed.js                 # Импорт ВСЕХ захардкоженных данных
│   └── queries/
├── middleware/
│   ├── auth.js                 # JWT-верификация, req.user
│   ├── admin.js                # Проверка role === "admin"
│   ├── validate.js             # Обёртка над express-validator
│   └── errorHandler.js         # Глобальный обработчик ошибок
├── routes/
│   ├── api.js                  # Корневой роутер /api
│   ├── auth.js                 # POST /auth/register, /auth/login, /auth/refresh
│   ├── profile.js              # GET/PUT /api/profile
│   ├── companies.js            # GET /api/companies, /api/companies/:id/tasks, /api/companies/:id/pieces
│   ├── tasks.js                # POST /api/tasks/:id/solve
│   ├── station-pieces.js       # POST /api/station-pieces/:id/complete
│   ├── questions.js            # GET /api/questions
│   ├── portfolio.js            # GET /api/portfolio/:userId
│   ├── teacher.js              # GET /api/teacher/students
│   ├── statistics.js           # GET /api/statistics/*
│   └── admin/                  # CRUD-админка
│       ├── index.js            # Роутер /api/admin/*
│       ├── users.js            # GET/PUT/DELETE пользователей
│       ├── companies.js        # CRUD предприятий
│       ├── station-pieces.js   # CRUD блоков станций
│       ├── questions.js        # CRUD вопросов диагностики
│       ├── tasks.js            # CRUD игровых задач
│       ├── achievements.js     # CRUD достижений
│       ├── final-results.js    # CRUD финальных результатов
│       ├── scoring-config.js   # CRUD конфигурации скоринга
│       ├── level-thresholds.js # CRUD порогов уровней
│       ├── game-config.js      # CRUD игровых конфигураций (workers, doc_rows)
│       └── exports.js          # Экспорт CSV/JSON статистики
└── utils/
    ├── jwt.js                  # sign / verify / refresh
    └── hash.js                 # bcrypt helpers
```

---

## 3. Схема базы данных (SQLite)

### 3.1 Таблица `users`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | TEXT | PK, DEFAULT (lower(hex(randomblob(16)))) | UUID |
| name | TEXT | NOT NULL | Имя и фамилия |
| email | TEXT | NOT NULL UNIQUE | Email (логин) |
| password_hash | TEXT | NOT NULL | bcrypt-хеш |
| category | TEXT | NOT NULL DEFAULT 'Школьник' | Школьник / Студент колледжа / Студент вуза |
| role | TEXT | NOT NULL DEFAULT 'student' | student / teacher / hr / admin |
| school | TEXT | DEFAULT NULL | Учебное заведение |
| region | TEXT | DEFAULT NULL | Регион |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | ISO-8601 |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | ISO-8601 |

**Индексы:** UNIQUE(email), INDEX(role)

---

### 3.2 Таблица `user_progress`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| track | TEXT | DEFAULT NULL | null / 'business' / 'career' |
| score | INTEGER | NOT NULL DEFAULT 0 | Общий счёт баллов |
| level | TEXT | NOT NULL DEFAULT 'новичок' | новичок / стажёр / мастер / эксперт |
| skills_initiative | INTEGER | NOT NULL DEFAULT 30 | |
| skills_analytics | INTEGER | NOT NULL DEFAULT 30 | |
| skills_team | INTEGER | NOT NULL DEFAULT 30 | |
| avatar_created | INTEGER | NOT NULL DEFAULT 0 | 0/1 |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(user_id), UNIQUE(user_id)

---

### 3.3 Таблица `user_answers`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| question_id | INTEGER | NOT NULL, FK→questions(id) | |
| answer_index | INTEGER | NOT NULL | 0–2 |
| score | INTEGER | NOT NULL | −3…+3 |
| skill | TEXT | NOT NULL | initiative / analytics / team |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(user_id, question_id), UNIQUE(user_id, question_id)

---

### 3.4 Таблица `user_station_progress`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| company_id | TEXT | NOT NULL, FK→companies(id) | |
| pieces | TEXT | NOT NULL DEFAULT '[]' | JSON-массив пройденных блоков |
| choice | TEXT | DEFAULT NULL | 'business' / 'career' / null |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(user_id, company_id), UNIQUE(user_id, company_id)

---

### 3.5 Таблица `user_task_results`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| company_id | TEXT | NOT NULL, FK→companies(id) | |
| task_id | INTEGER | NOT NULL | 1, 2, 3 |
| score | INTEGER | NOT NULL | Полученные баллы |
| time_seconds | INTEGER | NOT NULL | Время решения |
| correct | INTEGER | NOT NULL | 0/1 |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(user_id, company_id, task_id), UNIQUE(user_id, company_id, task_id)

---

### 3.6 Таблица `user_station_piece_answers`

Ответы на мини-задания блоков станций (StationPieceModal).

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| company_id | TEXT | NOT NULL, FK→companies(id) | |
| piece_index | INTEGER | NOT NULL | 0, 1, 2, 3 |
| selected_option | INTEGER | NOT NULL | Индекс варианта (0 или 1) |
| is_correct | INTEGER | DEFAULT NULL | 0/1 (null — не проверяется) |
| score_awarded | INTEGER | NOT NULL | 20 или 35 |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(user_id, company_id, piece_index), UNIQUE(user_id, company_id, piece_index)

---

### 3.7 Таблица `user_achievements`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| achievement_id | TEXT | NOT NULL, FK→achievements(id) | |
| unlocked_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**PK:** (user_id, achievement_id)

---

### 3.8 Таблица `user_avatar`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| user_id | TEXT | PK, FK→users(id) ON DELETE CASCADE | |
| skin | TEXT | NOT NULL DEFAULT '#f0b38f' | HEX |
| hair | TEXT | NOT NULL DEFAULT '#37251c' | HEX |
| suit | TEXT | NOT NULL DEFAULT '#536dfe' | HEX |
| hair_style | TEXT | DEFAULT 'default' | |
| suit_style | TEXT | DEFAULT 'default' | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

---

### 3.9 Таблица `user_tours`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| company_id | TEXT | NOT NULL, FK→companies(id) | |
| tour_date | TEXT | NOT NULL | Желаемая дата |
| phone | TEXT | NOT NULL | Контактный телефон |
| status | TEXT | NOT NULL DEFAULT 'pending' | pending / approved / rejected |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(user_id), INDEX(status)

---

### 3.10 Таблица `user_game_history`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| profession | TEXT | NOT NULL | foreman / engineer / inspector |
| timestamp | INTEGER | NOT NULL | Unix-мс |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(user_id, profession)

---

### 3.11 Таблица `companies` (справочник предприятий)

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | TEXT | PK | leps / mayak / vmp / biohim / kccm / final |
| name | TEXT | NOT NULL | Полное название |
| short | TEXT | NOT NULL | Короткое название |
| type | TEXT | NOT NULL | Отрасль |
| accent | TEXT | NOT NULL | CSS-цвет (HEX) |
| history | TEXT | NOT NULL | Описание истории |
| products | TEXT | NOT NULL | JSON-массив строк |
| careers | TEXT | NOT NULL | JSON-массив строк |
| partners | TEXT | NOT NULL | JSON-массив строк |
| game_profession | TEXT | DEFAULT NULL | energy / foreman / inspector / null |
| sort_order | INTEGER | NOT NULL DEFAULT 0 | Порядок отображения |
| is_active | INTEGER | NOT NULL DEFAULT 1 | 0 — скрыта |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

---

### 3.12 Таблица `station_pieces` (блоки станций — из StationPieceModal.jsx)

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| company_id | TEXT | NOT NULL, FK→companies(id) ON DELETE CASCADE | |
| piece_index | INTEGER | NOT NULL | 0, 1, 2, 3 |
| track | TEXT | DEFAULT NULL | null (общий), 'business', 'career' |
| title | TEXT | NOT NULL | Заголовок блока |
| visual | TEXT | NOT NULL | Текст визуального блока |
| facts | TEXT | NOT NULL | JSON-массив строк |
| task_question | TEXT | NOT NULL | Текст мини-задания |
| options | TEXT | NOT NULL | JSON-массив строк (2 варианта) |
| correct_option_index | INTEGER | DEFAULT NULL | Индекс правильного (null — любой) |
| score | INTEGER | NOT NULL DEFAULT 20 | 20 для 0-2, 35 для блока 3 |
| is_active | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(company_id, piece_index, track), UNIQUE(company_id, piece_index, track)

**Количество при сидировании:** 6 компаний × 6 записей = 36 записей (блоки 0,2 — track=null; блоки 1,3 — track=business/career).

---

### 3.13 Таблица `questions` (вопросы диагностики)

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| sort_order | INTEGER | NOT NULL DEFAULT 0 | |
| text | TEXT | NOT NULL | |
| is_active | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

---

### 3.14 Таблица `question_answers` (варианты ответов)

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| question_id | INTEGER | NOT NULL, FK→questions(id) ON DELETE CASCADE | |
| sort_order | INTEGER | NOT NULL DEFAULT 0 | |
| text | TEXT | NOT NULL | |
| score | INTEGER | NOT NULL | −3…+3 |
| skill | TEXT | NOT NULL | initiative / analytics / team |

**Индексы:** INDEX(question_id)

---

### 3.15 Таблица `achievements` (справочник достижений)

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | TEXT | PK | member / track_found / ... |
| name | TEXT | NOT NULL | |
| icon | TEXT | NOT NULL | |
| description | TEXT | NOT NULL | |
| condition_key | TEXT | NOT NULL | Ключ условия |
| is_game | INTEGER | NOT NULL DEFAULT 0 | 1 — игровое |
| is_active | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

---

### 3.16 Таблица `final_results` (финальные результаты — из FinalResultModal.jsx)

Для каждого трека (`business` / `career`) хранится финальный результат, показываемый после прохождения всех 6 станций.

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| track | TEXT | NOT NULL UNIQUE | 'business' / 'career' |
| title | TEXT | NOT NULL | Заголовок результата («Идея твоего бизнес-проекта» / «Твоя карьерная траектория») |
| project_name | TEXT | NOT NULL | Название проекта/профессии (напр. «Цех.Сигнал») |
| description | TEXT | NOT NULL | Развёрнутое описание |
| tags | TEXT | NOT NULL | JSON-массив строк (теги) |
| steps | TEXT | NOT NULL | JSON-массив строк (шаги 01–03) |
| is_active | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Соответствие полей из FinalResultModal.jsx:**
```
business/career                   → final_results.track
"Идея твоего бизнес-проекта"      → final_results.title
"«Цех.Сигнал»"                    → final_results.project_name
description (p)                   → final_results.description
result-tags (span[])              → final_results.tags (JSON array)
fact-list (div[])                 → final_results.steps (JSON array)
```

---

### 3.17 Таблица `tasks` (игровые задачи)

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| company_id | TEXT | NOT NULL, FK→companies(id) | |
| profession | TEXT | NOT NULL | foreman / energy / inspector |
| task_number | INTEGER | NOT NULL | 1, 2, 3 |
| title | TEXT | NOT NULL | |
| description | TEXT | NOT NULL | |
| task_type | TEXT | NOT NULL | choice / dragdrop / checkbox / invoice / inspection / doccheck |
| max_score | INTEGER | NOT NULL | |
| config_json | TEXT | DEFAULT '{}' | JSON: options, correctAnswer, emergency, ... |
| is_active | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** INDEX(company_id, profession, task_number), UNIQUE(company_id, profession, task_number)

---

### 3.18 Таблица `task_options` (варианты ответов)

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| task_id | INTEGER | NOT NULL, FK→tasks(id) ON DELETE CASCADE | |
| sort_order | INTEGER | NOT NULL DEFAULT 0 | |
| text | TEXT | NOT NULL | |
| is_correct | INTEGER | NOT NULL DEFAULT 0 | 0/1 |
| option_key | TEXT | DEFAULT NULL | Ключ (checkbox: factory/hospital/...) |

**Индексы:** INDEX(task_id)

---

### 3.19 Таблица `scoring_config` (конфигурация скоринга — из scoring.js)

Хранит BONUS_THRESHOLDS и другие настройки системы баллов. Одна запись на задачу (1–3).

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| task_number | INTEGER | NOT NULL UNIQUE | 1, 2, 3 |
| base_score | INTEGER | NOT NULL | Базовый балл (10 / 15 / 20) |
| bonus_threshold_ms | INTEGER | NOT NULL | Порог времени для бонуса в мс (20000 / 45000 / 15000) |
| bonus_points | INTEGER | NOT NULL | Бонусные баллы (3 / 5 / 2) |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Соответствие из scoring.js:**
```
BONUS_THRESHOLDS[taskNum]  → scoring_config
.ms                        → bonus_threshold_ms
.bonus                     → bonus_points
base[taskNum]              → base_score
```

---

### 3.20 Таблица `level_thresholds` (пороги уровней — из GameStateContext.jsx)

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| level_name | TEXT | NOT NULL UNIQUE | новичок / стажёр / мастер / эксперт |
| min_score | INTEGER | NOT NULL | Минимальный балл для уровня (0 / 100 / 250 / 450) |
| sort_order | INTEGER | NOT NULL DEFAULT 0 | 0–3 |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Соответствие:**
```
getLevel(score) в GameStateContext.jsx:
score >= 450 → "эксперт"
score >= 250 → "мастер"
score >= 100 → "стажёр"
else        → "новичок"
```

---

### 3.21 Таблица `game_workers` (рабочие для drag-drop — из GameModal.jsx)

ALL_WORKERS и правильные распределения для задачи «Распределение бригад» (Прораб, задача 2).

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK | 0–4 (соответствует ALL_WORKERS) |
| name | TEXT | NOT NULL | Имя рабочего |
| role | TEXT | NOT NULL | Должность |
| color | TEXT | NOT NULL | HEX-цвет |
| correct_zone | TEXT | NOT NULL | 'foundation' / 'walls' |
| is_active | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Соответствие из GameModal.jsx:**
```
ALL_WORKERS[i]        → game_workers
.id                   → id
.name                 → name
.role                 → role
.color                → color
CORRECT_FOUNDATION    → correct_zone = 'foundation'
CORRECT_WALLS         → correct_zone = 'walls'
```

---

### 3.22 Таблица `game_doc_rows` (строки проверки документации — из GameModal.jsx)

DOC_ROWS для задачи «Проверка документации» (Инженер КК, задача 2).

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| row_index | INTEGER | NOT NULL | 0–5 |
| act_text | TEXT | NOT NULL | Текст из акта бригады |
| norm_text | TEXT | NOT NULL | Текст норматива |
| is_error | INTEGER | NOT NULL DEFAULT 0 | 1 — строка с ошибкой |
| is_active | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Соответствие из GameModal.jsx:**
```
DOC_ROWS[i]           → game_doc_rows
.idx                  → row_index
.actText              → act_text
.normText             → norm_text
.isError              → is_error
```

---

### 3.23 Таблица `refresh_tokens`

| Поле | Тип | Ограничения | Описание |
|------|-----|------------|----------|
| id | INTEGER | PK AUTOINCREMENT | |
| user_id | TEXT | NOT NULL, FK→users(id) ON DELETE CASCADE | |
| token | TEXT | NOT NULL UNIQUE | Refresh-токен |
| expires_at | TEXT | NOT NULL | ISO-8601 |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | |

**Индексы:** UNIQUE(token), INDEX(user_id)

---

## 4. API — полный список эндпоинтов

### 4.1 Аутентификация

| Метод | Путь | Тело | Ответ | Auth |
|-------|------|------|-------|------|
| POST | /auth/register | `{ name, email, password, category }` | `{ user, accessToken, refreshToken }` | Нет |
| POST | /auth/login | `{ email, password }` | `{ user, accessToken, refreshToken }` | Нет |
| POST | /auth/refresh | `{ refreshToken }` | `{ accessToken, refreshToken }` | Нет |
| POST | /auth/logout | `{ refreshToken }` | `{ ok: true }` | JWT |

### 4.2 Профиль

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/profile | Профиль + прогресс + аватар + достижения | JWT |
| PUT | /api/profile | Обновить name, email, category, school, region | JWT |
| PUT | /api/profile/avatar | Обновить аватар | JWT |
| GET | /api/profile/achievements | Достижения | JWT |
| GET | /api/profile/progress | Полный прогресс | JWT |
| GET | /api/profile/tours | Заявки на экскурсии | JWT |
| POST | /api/profile/tours | Создать заявку | JWT |

### 4.3 Предприятия и блоки

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/companies | Список предприятий (+ статус разблокировки) | Опц. |
| GET | /api/companies/:id | Детали предприятия | Опц. |
| GET | /api/companies/:id/tasks | Задачи профессии | Опц. |
| GET | /api/companies/:id/pieces | 4 блока станции (`?track=business\|career`) | Опц. |
| GET | /api/companies/:id/pieces/:index | Конкретный блок | Опц. |

### 4.4 Блоки станций

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| POST | /api/station-pieces/:id/complete | Завершить блок: `{ selectedOption }` → баллы | JWT |

### 4.5 Задачи (игровые)

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/tasks/:id | Детали задачи | Опц. |
| POST | /api/tasks/:id/solve | Решение → проверка, баллы, достижения | JWT |
| POST | /api/companies/:cid/solve-all | Массовая отправка 3 задач | JWT |

### 4.6 Вопросы диагностики

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/questions | Список вопросов с вариантами | Опц. |
| POST | /api/questions/submit | Все 7 ответов → трек, 40 баллов | JWT |

### 4.7 Портфолио

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/portfolio | Портфолио текущего (JSON) | JWT |
| GET | /api/portfolio/:userId | Портфолио пользователя | JWT + teacher/hr/admin |

### 4.8 Педагог

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/teacher/students | Список учеников | JWT + teacher |
| GET | /api/teacher/students/:userId | Прогресс ученика | JWT + teacher |
| POST | /api/teacher/students/link | Привязать ученика | JWT + teacher |
| DELETE | /api/teacher/students/:userId | Отвязать | JWT + teacher |

### 4.9 Статистика

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/statistics/professions | Популярность профессий | Нет |
| GET | /api/statistics/scores | Средние баллы по станциям | Нет |
| GET | /api/statistics/tracks | Распределение треков | Нет |
| GET | /api/statistics/global | Общая статистика | Нет |

### 4.10 Финальные результаты

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/final-result?track=business\|career | Финальный результат для трека | JWT |

### 4.11 Конфигурация (публичная)

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | /api/config/scoring | BONUS_THRESHOLDS (бонусы за скорость) | Нет |
| GET | /api/config/levels | Пороги уровней | Нет |
| GET | /api/config/game | Игровые конфигурации (workers, doc_rows) | Нет |

---

## 5. Админ-панель (CRUD /api/admin/*, все требуют JWT + admin)

### 5.1 Пользователи

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/users | Список (+ пагинация, фильтр) |
| GET | /api/admin/users/:id | Детали |
| PUT | /api/admin/users/:id | Редактировать |
| DELETE | /api/admin/users/:id | Удалить |
| GET | /api/admin/users/:id/export | Экспорт JSON |

### 5.2 Компании

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/companies | Список |
| POST | /api/admin/companies | Создать |
| PUT | /api/admin/companies/:id | Редактировать |
| DELETE | /api/admin/companies/:id | Удалить |

### 5.3 Блоки станций

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/station-pieces | Список (фильтр) |
| GET | /api/admin/station-pieces/:id | Конкретный |
| POST | /api/admin/station-pieces | Создать |
| PUT | /api/admin/station-pieces/:id | Редактировать |
| DELETE | /api/admin/station-pieces/:id | Удалить |
| POST | /api/admin/companies/:cid/pieces/seed | Автогенерация 4 блоков |

### 5.4 Финальные результаты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/final-results | Список |
| GET | /api/admin/final-results/:id | Конкретный |
| POST | /api/admin/final-results | Создать |
| PUT | /api/admin/final-results/:id | Редактировать |
| DELETE | /api/admin/final-results/:id | Удалить |

### 5.5 Вопросы диагностики

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/questions | Список + ответы |
| POST | /api/admin/questions | Создать вопрос |
| PUT | /api/admin/questions/:id | Редактировать |
| DELETE | /api/admin/questions/:id | Удалить |
| POST | /api/admin/questions/:id/answers | Добавить ответ |
| PUT | /api/admin/questions/:qid/answers/:aid | Редактировать ответ |
| DELETE | /api/admin/questions/:qid/answers/:aid | Удалить ответ |

### 5.6 Достижения

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/achievements | Список |
| POST | /api/admin/achievements | Создать |
| PUT | /api/admin/achievements/:id | Редактировать |
| DELETE | /api/admin/achievements/:id | Удалить |

### 5.7 Игровые задачи

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/tasks | Список |
| POST | /api/admin/tasks | Создать |
| PUT | /api/admin/tasks/:id | Редактировать |
| DELETE | /api/admin/tasks/:id | Удалить |

### 5.8 Конфигурация скоринга

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/scoring-config | Список (3 записи) |
| PUT | /api/admin/scoring-config/:id | Редактировать пороги бонуса |

### 5.9 Пороги уровней

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/level-thresholds | Список (4 записи) |
| PUT | /api/admin/level-thresholds/:id | Редактировать порог |

### 5.10 Игровая конфигурация

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/game-workers | Список рабочих |
| PUT | /api/admin/game-workers/:id | Редактировать рабочего |
| GET | /api/admin/game-doc-rows | Список строк документации |
| PUT | /api/admin/game-doc-rows/:id | Редактировать строку |

### 5.11 Экспорт

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/admin/exports/users | CSV пользователей |
| GET | /api/admin/exports/progress | CSV прогресса |
| GET | /api/admin/exports/tours | CSV экскурсий |
| GET | /api/admin/exports/full | JSON дамп |

---

## 6. План миграции данных из захардкоженных файлов

### Сводная таблица источников

| Исходный файл | Таблица(ы) БД | Записей |
|--------------|--------------|---------|
| `client/src/data/companies.js` | `companies` | 6 |
| `client/src/data/questions.js` | `questions` + `question_answers` | 7 + 21 |
| `client/src/data/achievements.js` | `achievements` | 14 |
| `client/src/components/modals/StationPieceModal.jsx` (массив `contents`) | `station_pieces` | 36 |
| `client/src/components/modals/FinalResultModal.jsx` | `final_results` | 2 |
| `client/src/components/modals/GameModal.jsx` (`getTasks()`) | `tasks` + `task_options` | 9 + ~20 |
| `client/src/components/modals/GameModal.jsx` (`ALL_WORKERS`) | `game_workers` | 5 |
| `client/src/components/modals/GameModal.jsx` (`DOC_ROWS`) | `game_doc_rows` | 6 |
| `client/src/utils/scoring.js` (`BONUS_THRESHOLDS`) | `scoring_config` | 3 |
| `client/src/context/GameStateContext.jsx` (`getLevel()`) | `level_thresholds` | 4 |

### Сидирование

Скрипт `server/db/seed.js`:
1. Проверяет, есть ли данные в таблицах (не дублирует)
2. Импортирует все сущности в порядке: companies → station_pieces → questions → achievements → final_results → tasks → task_options → game_workers → game_doc_rows → scoring_config → level_thresholds
3. Создаёт администратора из `.env`

---

## 7. Аутентификация и авторизация

- **Access-токен:** 15 минут, payload: `{ userId, role, iat, exp }`
- **Refresh-токен:** 30 дней, хранится в `refresh_tokens`, одноразовый
- **Middleware `auth.js`:** JWT → `req.user = { id, role }`, 401
- **Middleware `admin.js`:** `role === 'admin'`, 403
- **Middleware `teacher.js`:** `role === 'teacher'`, 403

---

## 8. Валидация и безопасность

- express-validator на всех входах
- bcrypt (12 раундов), пароль ≥ 6 символов
- express-rate-limit: 5 попыток/минуту на `/auth/*`
- CORS: `localhost:5173` (dev)
- Helmet для заголовков

---

## 9. Переменные окружения (.env)

```env
PORT=4173
NODE_ENV=development
DB_PATH=./server/db/marshrutka.sqlite
JWT_SECRET=change-me-to-random-64-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
ADMIN_EMAIL=admin@marshrutka.ru
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:5173
```

---

## 10. Сводка

### Что уже есть (v2.0):

| Компонент | Статус |
|-----------|--------|
| Express-сервер | ✅ Статика + SPA fallback |
| API-заглушки | ✅ 501 Not Implemented |
| React-фронтенд | ✅ Полный UX студента |
| localStorage | ✅ GameStateContext |
| Захардкоженные данные | ✅ Все в `client/src/` |

### Что добавляет бекенд v2.1:

| Компонент | Источник |
|-----------|----------|
| Регистрация/вход (JWT) | Новое |
| Хранение прогресса (SQLite) | Вместо localStorage |
| Предприятия (6) | `companies.js` |
| Блоки станций (36) | `StationPieceModal.jsx` |
| Вопросы диагностики (7 + 21) | `questions.js` |
| Достижения (14) | `achievements.js` |
| Игровые задачи (9 + ~20) | `GameModal.jsx → getTasks()` |
| Финальные результаты (2) | `FinalResultModal.jsx` |
| Конфиг скоринга (3) | `scoring.js → BONUS_THRESHOLDS` |
| Пороги уровней (4) | `GameStateContext.jsx → getLevel()` |
| Игровые рабочие (5) | `GameModal.jsx → ALL_WORKERS` |
| Строки документации (6) | `GameModal.jsx → DOC_ROWS` |
| Статистика | Агрегация из БД |
| Админ-панель | CRUD всех сущностей |
| Кабинет педагога | Управление учениками |

### План внедрения:

1. **Фаза 1:** База + миграции + сиды (все 23 таблицы)
2. **Фаза 2:** Auth API
3. **Фаза 3:** API профиля и прогресса
4. **Фаза 4:** API контента (все справочники)
5. **Фаза 5:** FRONTEND-адаптация
6. **Фаза 6:** Админ-панель API
7. **Фаза 7:** Учительский кабинет
8. **Фаза 8:** Статистика и экспорт

---

## 11. Ключевые проектные решения

- **better-sqlite3:** синхронный API, нет пула соединений, идеально для SQLite
- **UUID TEXT PK:** совместимость с localStorage, безопасность API
- **JSON-строки для массивов:** SQLite не имеет ARRAY, парсинг на сервере
- **Track-dependent контент:** `station_pieces.track` и `final_results.track` фильтруют контент по треку пользователя
- **Гибкая конфигурация:** `scoring_config`, `level_thresholds`, `game_workers`, `game_doc_rows` позволяют менять игровую механику без пересборки фронтенда

---

## 12. Список npm-зависимостей

```json
{
  "name": "marshrutka-server",
  "version": "2.1.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "db:migrate": "node db/migrate.js",
    "db:seed": "node db/seed.js",
    "db:reset": "node db/migrate.js --reset && node db/seed.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "better-sqlite3": "^11.0.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.0",
    "dotenv": "^16.4.0",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "express-rate-limit": "^7.0.0"
  }
}