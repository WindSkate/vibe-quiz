# Quiz Game - AGENTS.md

## Обзор проекта

Онлайн-викторина в стиле Kahoot! Игроки подключаются к лобби через смартфоны, отвечают на вопросы с вариантами ответов, соревнуются за баллы. После каждого вопроса показывается разбор ответов (Answer Reveal), результаты показываются только в конце игры.

---

## Технологический стек

### Backend
- **Java 21** + **Spring Boot 3.x**
- **Spring Web** — REST API
- **Spring WebSocket** + **STOMP** — реалтайм коммуникация
- **Spring Data JPA** — работа с БД
- **Lombok** — сокращение boilerplate
- **MapStruct** — маппинг DTO <-> Entity
- **PostgreSQL** — основное хранилище (темы, вопросы)
- **Redis** — игровые сессии, лобби, игроки (временные данные)
- **Flyway** — миграции БД

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** — стилизация
- **React Router** — роутинг
- **@stomp/stompjs** — WebSocket клиент
- **Axios** — HTTP запросы
- **Zustand** — state management

### Инфраструктура
- **Docker Compose** — локальная разработка (app + postgres + redis)
- **Nginx** — reverse proxy для фронтенда

---

## Структура проекта

```
vibe_quiz/
├── backend/
│   ├── src/main/java/com/quiz/
│   │   ├── QuizApplication.java
│   │   ├── config/
│   │   │   ├── WebSocketConfig.java
│   │   │   ├── RedisConfig.java
│   │   │   └── WebConfig.java
│   │   ├── controller/
│   │   │   ├── TopicController.java
│   │   │   ├── QuestionController.java
│   │   │   ├── ImageController.java
│   │   │   └── LobbyController.java
│   │   ├── websocket/
│   │   │   ├── GameWebSocketController.java
│   │   │   └── LobbyWebSocketController.java
│   │   ├── service/
│   │   │   ├── TopicService.java
│   │   │   ├── QuestionService.java
│   │   │   ├── ImageService.java
│   │   │   ├── LobbyService.java
│   │   │   ├── GameSessionService.java
│   │   │   ├── GameTimerService.java
│   │   │   └── ScoringService.java
│   │   ├── repository/
│   │   │   ├── TopicRepository.java
│   │   │   └── QuestionRepository.java
│   │   ├── entity/
│   │   │   ├── Topic.java
│   │   │   └── Question.java
│   │   ├── dto/
│   │   │   ├── TopicDto.java
│   │   │   ├── QuestionDto.java
│   │   │   ├── LobbyDto.java
│   │   │   ├── PlayerDto.java
│   │   │   ├── GameResultDto.java
│   │   │   ├── QuestionEvent.java
│   │   │   ├── AnswerRevealEvent.java
│   │   │   ├── TimeoutEvent.java
│   │   │   ├── ResultsEvent.java
│   │   │   ├── LobbyUpdateEvent.java
│   │   │   └── ... (request/response DTOs)
│   │   ├── mapper/
│   │   │   ├── TopicMapper.java
│   │   │   └── QuestionMapper.java
│   │   ├── model/
│   │   │   └── GameState.java (enum: WAITING, PLAYING, FINISHED)
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java
│   │       ├── LobbyException.java
│   │       ├── ResourceNotFoundException.java
│   │       └── StorageException.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── db/migration/
│   │   └── storage/ (загруженные изображения)
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── HostLobbyPage.tsx
│   │   │   ├── HostWaitingPage.tsx
│   │   │   ├── HostGamePage.tsx
│   │   │   ├── HostAnswerRevealPage.tsx
│   │   │   ├── HostResultsPage.tsx
│   │   │   ├── PlayerJoinPage.tsx
│   │   │   ├── PlayerWaitingPage.tsx
│   │   │   ├── PlayerAnswerPage.tsx
│   │   │   ├── PlayerAnswerRevealPage.tsx
│   │   │   ├── PlayerResultsPage.tsx
│   │   │   ├── EditorPage.tsx
│   │   │   └── TopicListPage.tsx
│   │   ├── components/
│   │   │   ├── ImageUploader.tsx
│   │   │   └── QuestionEditor.tsx
│   │   ├── stores/
│   │   │   ├── hostStore.ts
│   │   │   └── playerStore.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   └── types/
│   │       └── index.ts
│   ├── e2e/
│   │   ├── lobby-creation.spec.ts
│   │   ├── full-game-flow.spec.ts
│   │   ├── skip-timer.spec.ts
│   │   ├── player-reconnection.spec.ts
│   │   └── player-refresh-reconnection.spec.ts
│   ├── public/
│   │   └── favicon.png
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
├── .data/
│   ├── postgres_data/
│   ├── storage/
│   └── Potato.png (favicon source)
├── docker-compose.yml
└── AGENTS.md
```

---

## Схема базы данных (PostgreSQL)

### Таблица: topics
```sql
CREATE TABLE topics (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: questions
```sql
CREATE TABLE questions (
    id          BIGSERIAL PRIMARY KEY,
    topic_id    BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    image_path  VARCHAR(500),
    option_a    VARCHAR(500) NOT NULL,
    option_b    VARCHAR(500) NOT NULL,
    option_c    VARCHAR(500) NOT NULL,
    option_d    VARCHAR(500) NOT NULL,
    correct     CHAR(1) NOT NULL CHECK (correct IN ('A', 'B', 'C', 'D')),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_topic_id ON questions(topic_id);
```

---

## Структура данных в Redis

### Lobby (Hash)
```
Key: lobby:{code}
Fields:
  - code: string (3 цифры, например "123")
  - topicId: long
  - topicName: string
  - hostId: string
  - state: WAITING | PLAYING | FINISHED
  - currentQuestionIndex: int
  - playerCount: int
  - createdAt: timestamp
```

### Player (Hash)
```
Key: player:{lobbyCode}:{playerId}
Fields:
  - id: string (UUID)
  - name: string
  - lobbyCode: string
  - score: int
  - connected: boolean
```

### Game Session (Hash)
```
Key: game:{lobbyCode}
Fields:
  - lobbyCode: string
  - questions: JSON array (выбранные вопросы, до 20)
  - currentIndex: int
  - answers: JSON (playerId -> answer)
  - scores: JSON (playerId -> score)
  - startedAt: timestamp
  - questionStartedAt: timestamp (время начала текущего вопроса)
  - phase: string (QUESTION | ANSWER_REVEAL)
```

### Set: players in lobby
```
Key: lobby:{code}:players
Members: [playerId1, playerId2, ...]
```

---

## REST API

### Темы
```
GET    /api/topics              — список всех тем
GET    /api/topics/{id}         — тема с вопросами
POST   /api/topics              — создать тему
PUT    /api/topics/{id}         — обновить тему
DELETE /api/topics/{id}         — удалить тему
```

### Вопросы
```
GET    /api/topics/{topicId}/questions          — список вопросов темы
POST   /api/topics/{topicId}/questions          — создать вопрос
PUT    /api/questions/{id}                      — обновить вопрос
DELETE /api/questions/{id}                      — удалить вопрос
```

### Изображения
```
POST   /api/images              — загрузить изображение (multipart)
GET    /images/{filename}       — получить изображение (статика)
DELETE /api/images/{filename}   — удалить изображение
```

### Лобби
```
POST   /api/lobbies             — создать лобби (возвращает код)
GET    /api/lobbies/{code}      — получить инфо о лобби
POST   /api/lobbies/{code}/join — присоединиться к лобби
GET    /api/lobbies/{code}/players — получить список игроков
```

---

## WebSocket (STOMP)

### Endpoints
```
Connect: /ws (с SockJS fallback)

Subscribe destinations:
  /topic/lobby/{code}        — обновления лобби (игроки подключились)
  /topic/game/{code}         — игровые события (вопрос, таймер, результаты)
  /topic/player-{playerId}   — персональные сообщения для переподключившегося игрока

Send destinations:
  /app/lobby/{code}/start    — начать игру (хост)
  /app/game/{code}/answer    — отправить ответ (игрок)
  /app/game/{code}/next      — перейти к следующему вопросу (хост или таймер)
  /app/game/{code}/state     — запросить текущее состояние игры (переподключение)
```

### Игровые события (server -> client)

**LOBBY_UPDATE**
```json
{
  "type": "LOBBY_UPDATE",
  "players": [
    { "id": "...", "name": "Игрок 1" },
    { "id": "...", "name": "Игрок 2" }
  ],
  "playerCount": 2
}
```

**QUESTION**
```json
{
  "type": "QUESTION",
  "questionNumber": 1,
  "totalQuestions": 20,
  "text": "Что изображено на картинке?",
  "imagePath": "/images/abc123.jpg",
  "options": ["A", "B", "C", "D"],
  "timeLeft": 30
}
```

**TIMEOUT**
```json
{
  "type": "TIMEOUT",
  "message": "Время вышло!"
}
```

**ANSWER_REVEAL**
```json
{
  "type": "ANSWER_REVEAL",
  "correctAnswer": "A",
  "playerAnswers": {
    "playerId1": "A",
    "playerId2": "B"
  }
}
```

**RESULTS**
```json
{
  "type": "RESULTS",
  "results": [
    { "rank": 1, "name": "Игрок 1", "score": 18 },
    { "rank": 2, "name": "Игрок 2", "score": 15 },
    { "rank": 3, "name": "Игрок 3", "score": 12 }
  ]
}
```

### Действия (client -> server)

**START_GAME**
```json
{
  "lobbyCode": "123"
}
```

**SUBMIT_ANSWER**
```json
{
  "lobbyCode": "123",
  "playerId": "...",
  "answer": "A"
}
```

**NEXT_QUESTION**
```json
{
  "lobbyCode": "123"
}
```

**GET_GAME_STATE** (для переподключения)
```json
{
  "lobbyCode": "123",
  "playerId": "..."
}
```

---

## Фронтенд — страницы

### Host (ПК/Телевизор)
1. **HostLobbyPage** — выбор темы, создание лобби
2. **HostWaitingPage** — список подключившихся игроков, кнопка "Начать", QR-код
3. **HostGamePage** — отображение вопроса с картинкой, таймер, варианты ответов
4. **HostAnswerRevealPage** — разбор ответов, правильный ответ, кто как ответил, кнопка "Следующий вопрос"
5. **HostResultsPage** — таблица лидеров

### Player (Смартфон)
1. **PlayerJoinPage** — ввод кода лобби (3 цифры) и имени, автоматическое переподключение при наличии сессии
2. **PlayerWaitingPage** — "Ждём начала игры..."
3. **PlayerAnswerPage** — 4 большие кнопки с вариантами (без картинки, только текст вопроса и варианты), таймер
4. **PlayerAnswerRevealPage** — правильный/неправильный ответ, разбор вариантов, кнопка "Продолжить"
5. **PlayerResultsPage** — своё место в рейтинге

### Редактор
1. **TopicListPage** — список тем, кнопка "Создать"
2. **EditorPage** — редактирование темы, список вопросов, создание/редактирование вопросов

---

## Игровой процесс

1. Хост создаёт лобби, выбирает тему -> получает код (3 цифры)
2. Игроки вводят код + имя на своих телефонах
3. Хост видит список игроков, нажимает "Начать"
4. Если вопросов > 20, случайно выбираются 20
5. Каждый вопрос:
   - **Фаза QUESTION (30 секунд)**:
     - Хост видит вопрос с картинкой и таймер
     - Игроки видят текст вопроса и 4 кнопки для ответа (без картинки)
     - Если все игроки ответили, таймер пропускается
   - **Фаза ANSWER_REVEAL (60 секунд)**:
     - Хост видит разбор ответов, правильный ответ, кто как ответил
     - Игроки видят свой результат (правильно/неправильно)
     - Хост нажимает "Следующий вопрос" или таймер автоматически переходит
   - Правильный ответ = 1 балл
6. После последнего вопроса — таблица результатов

---

## Переподключение игроков

### Механизм
- При входе в лобби игрок получает `playerId`, который сохраняется в `localStorage` (ключ: `quiz-player-session`)
- При перезагрузке страницы игрок автоматически переподключается с тем же `playerId`
- Backend разрешает повторный join с тем же именем во время фазы PLAYING
- После переподключения игрок отправляет запрос `/app/game/{code}/state` с `playerId`
- Backend отправляет текущее состояние игры на персональную очередь `/topic/player-{playerId}`

### Сценарии переподключения
1. **Во время QUESTION** — игрок получает текущий вопрос с оставшимся временем
2. **Во время ANSWER_REVEAL** — игрок получает текущий вопрос (с timeLeft=0) и затем ANSWER_REVEAL
3. **Во время WAITING** — игрок попадает на страницу ожидания
4. **Во время FINISHED** — игрок получает RESULTS

---

## Ключевые решения

### Архитектура
- **GameTimerService** — вынесен в отдельный сервис для управления таймерами вопросов, чтобы избежать циклических зависимостей
- **Skip Timer** — вопрос пропускается мгновенно, когда все игроки ответили (`answeredCount == playerCount`), не дожидаясь 30с таймера
- **Phase Tracking** — в Redis хранится текущая фаза игры (QUESTION/ANSWER_REVEAL) для корректного переподключения
- **Personal Queue** — для переподключения используется персональная очередь `/topic/player-{playerId}`, чтобы не нарушать broadcast для других игроков

### Frontend
- **Тёмная тема** — `bg-gray-950` фон, монохромные серые карточки вариантов ответов
- **Латинские буквы** — варианты ответов используют `A, B, C, D` (бэкенд ожидает латиницу в `correct` поле)
- **Мобильная вёрстка** — `PlayerAnswerPage` использует `flex-col` для вариантов (одна колонка), `HostGamePage` — `grid-cols-2`
- **localStorage** — сессия игрока сохраняется для автоматического переподключения
- **Zustand stores** — `hostStore` и `playerStore` управляют состоянием, WS подключение асинхронное
- **Answer Reveal** — после каждого вопроса показывается разбор ответов, требуется нажатие "Продолжить"/"Следующий вопрос"

### Тестирование
- **13 Playwright e2e тестов**:
  - `lobby-creation.spec.ts` — создание лобби, подключение 1-3 игроков, edge cases
  - `full-game-flow.spec.ts` — полный игровой цикл с 2 игроками
  - `skip-timer.spec.ts` — валидация мгновенного перехода при всех ответах
  - `player-reconnection.spec.ts` — переподключение во время игры и answer reveal
  - `player-refresh-reconnection.spec.ts` — автоматическое переподключение после перезагрузки страницы

### Docker
- Фронтенд собирается в Nginx-контейнер (порт 3000), бэкенд на 8080
- PostgreSQL и Redis запускаются вместе с приложением через `docker compose up -d`
- Данные PostgreSQL хранятся в `.data/postgres_data/`
- Загруженные изображения хранятся в `.data/storage/`

---

## Полезные команды

### Backend
```bash
cd backend
./mvnw spring-boot:run          # запуск
./mvnw clean install            # сборка
./mvnw test                     # тесты
```

### Frontend
```bash
cd frontend
npm run dev                     # dev сервер
npm run build                   # продакшн сборка
npm run lint                    # линт
npx playwright test             # e2e тесты (13 тестов)
```

### Docker
```bash
docker compose up -d            # запустить всё
docker compose down             # остановить
docker compose logs -f backend  # логи бэкенда
docker compose up -d --build backend frontend  # пересобрать и перезапустить
```

### Тестовые данные
- `.data/Potato.png` — исходник для favicon
