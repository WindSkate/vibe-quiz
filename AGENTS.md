# Quiz Game - AGENTS.md

## Обзор проекта

Онлайн-викторина в стиле Kahoot! Игроки подключаются к лобби через смартфоны, отвечают на вопросы с вариантами ответов, соревнуются за баллы. Результаты показываются только в конце игры.

---

## Технологический стек

### Backend
- **Java 21** + **Spring Boot 3.x**
- **Spring Web** — REST API
- **Spring WebSocket** + **STOMP** — реалтайм коммуникация
- **Spring Data JPA** — работа с БД
- **Lombok** — сокращение boilerplate
- **MapStruct** — маппинг DTO <-> Entity
- **Spring Validation** — валидация входных данных
- **PostgreSQL** — основное хранилище (темы, вопросы)
- **Redis** — игровые сессии, лобби, игроки (временные данные)
- **Flyway** — миграции БД

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** — стилизация
- **React Router** — роутинг
- **@stomp/stompjs** — WebSocket клиент
- **Axios** — HTTP запросы
- **Zustand** — state management (легковесный, проще Redux)

### Инфраструктура
- **Docker Compose** — локальная разработка (app + postgres + redis)
- **Nginx** — reverse proxy (опционально)

---

## Архитектура

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Host View   │  │ Player View  │  │  Editor    │ │
│  │  (PC/TV)     │  │  (Mobile)    │  │  (Topics)  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                 │        │
│    REST + WebSocket (STOMP)                  │        │
└─────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼────────┐
│         ▼                 ▼                 ▼        │
│              Backend (Spring Boot)                   │
│  ┌──────────────────────────────────────────────┐   │
│  │  REST Controllers  │  WebSocket Controllers  │   │
│  └────────┬───────────┴──────────┬──────────────┘   │
│           │                      │                   │
│  ┌────────▼────────┐   ┌─────────▼──────────────┐  │
│  │  TopicService   │   │  GameSessionService    │  │
│  │  QuestionService│   │  LobbyService          │  │
│  │  ImageService   │   │  ScoringService        │  │
│  └────────┬────────┘   └─────────┬──────────────┘  │
│           │                      │                   │
│  ┌────────▼────────┐   ┌─────────▼──────────────┐  │
│  │   PostgreSQL    │   │        Redis           │  │
│  │  (topics,       │   │  (lobbies, players,    │  │
│  │   questions)    │   │   game sessions)       │  │
│  └─────────────────┘   └────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## Структура проекта

```
quiz_from_zero/
├── backend/
│   ├── src/main/java/com/quiz/
│   │   ├── QuizApplication.java
│   │   ├── config/
│   │   │   ├── WebSocketConfig.java
│   │   │   ├── RedisConfig.java
│   │   │   ├── WebConfig.java
│   │   │   └── StorageConfig.java
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
│   │   │   └── GameResultDto.java
│   │   ├── mapper/
│   │   │   ├── TopicMapper.java
│   │   │   └── QuestionMapper.java
│   │   ├── model/
│   │   │   ├── Lobby.java          (Redis)
│   │   │   ├── Player.java         (Redis)
│   │   │   ├── GameSession.java    (Redis)
│   │   │   └── GameState.java      (enum)
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java
│   │       └── ... (custom exceptions)
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── db/migration/
│   │   └── storage/                (загруженные изображения)
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── HostLobbyPage.tsx
│   │   │   ├── HostGamePage.tsx
│   │   │   ├── HostResultsPage.tsx
│   │   │   ├── PlayerJoinPage.tsx
│   │   │   ├── PlayerAnswerPage.tsx
│   │   │   ├── PlayerWaitingPage.tsx
│   │   │   ├── PlayerResultsPage.tsx
│   │   │   ├── EditorPage.tsx
│   │   │   └── TopicListPage.tsx
│   │   ├── components/
│   │   │   ├── ui/                 (базовые компоненты)
│   │   │   ├── LobbyCode.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── Timer.tsx
│   │   │   ├── ResultsTable.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useTimer.ts
│   │   ├── stores/
│   │   │   ├── gameStore.ts
│   │   │   └── lobbyStore.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── assets/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
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
  - questions: JSON array (выбранные 20 вопросов)
  - currentIndex: int
  - answers: JSON (playerId -> answer)
  - scores: JSON (playerId -> score)
  - startedAt: timestamp
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
```

---

## WebSocket (STOMP)

### Endpoints
```
Connect: /ws
Subscribe destinations:
  /topic/lobby/{code}        — обновления лобби (игроки подключились)
  /topic/game/{code}         — игровые события (вопрос, таймер, результаты)
  /queue/user                — персональные сообщения (через @SendToUser)

Send destinations:
  /app/lobby/{code}/start    — начать игру (хост)
  /app/game/{code}/answer    — отправить ответ (игрок)
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

---

## Фронтенд — страницы

### Host (ПК/Телевизор)
1. **Создание лобби** — выбор темы, генерация кода, отображение QR-кода
2. **Ожидание игроков** — список подключившихся, кнопка "Начать"
3. **Игра** — отображение вопроса с картинкой, таймер, варианты ответов
4. **Результаты** — таблица лидеров

### Player (Смартфон)
1. **Подключение** — ввод кода лобби (3 цифры) и имени
2. **Ожидание** — "Ждём начала игры..."
3. **Ответ** — 4 большие кнопки с вариантами (без картинки, только текст вопроса и варианты)
4. **Результаты** — своё место в рейтинге

### Редактор
1. **Список тем** — все темы, кнопка "Создать"
2. **Редактирование темы** — название, описание, список вопросов
3. **Создание/редактирование вопроса** — текст, загрузка картинки, 4 варианта, выбор правильного

---

## Игровой процесс

1. Хост создаёт лобби, выбирает тему -> получает код (3 цифры)
2. Игроки вводят код + имя на своих телефонах
3. Хост видит список игроков, нажимает "Начать"
4. Если вопросов > 20, случайно выбираются 20
5. Каждый вопрос:
   - Хост видит вопрос с картинкой и таймер
   - Игроки видят текст вопроса и 4 кнопки для ответа (без картинки)
   - 30 секунд на ответ
   - Правильный ответ = 1 балл
6. После последнего вопроса — таблица результатов

---

## Docker Compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: quiz
      POSTGRES_USER: quiz
      POSTGRES_PASSWORD: quiz
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/quiz
      SPRING_DATASOURCE_USERNAME: quiz
      SPRING_DATASOURCE_PASSWORD: quiz
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## Соглашения по коду

### Backend
- Использовать **record** для DTO когда не нужна мутация
- **Lombok**: `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` для entity
- **MapStruct**: `@Mapper(componentModel = "spring")` для всех мапперов
- **Validation**: `@Valid`, `@NotBlank`, `@NotNull`, `@Size` на DTO
- **Exceptions**: кастомные исключения + `@RestControllerAdvice` для глобальной обработки
- **Naming**: сервисы — `XxxService`, репозитории — `XxxRepository`
- **Redis**: использовать `@RedisHash` для сущностей или `RedisTemplate`

### Frontend
- **Функциональные компоненты** + hooks
- **TypeScript strict mode**
- **Tailwind** для стилей, без CSS-in-JS
- **Zustand** для глобального стейта
- **Компоненты**: PascalCase, hooks: camelCase с `use` префиксом
- **API вызовы**: вынесены в отдельные сервисы

---

## План разработки (по шагам)

### Шаг 1: Инициализация проекта
- [x] Создать структуру директорий
- [x] Настроить `docker-compose.yml` (postgres + redis)
- [x] Инициализировать Spring Boot проект (pom.xml)
- [x] Инициализировать React проект (Vite)
- [x] Настроить базовые конфиги

### Шаг 2: База данных и CRUD для тем/вопросов
- [x] Flyway миграции
- [x] Entity + Repository
- [x] DTO + MapStruct мапперы
- [x] REST контроллеры для тем
- [x] REST контроллеры для вопросов
- [x] Загрузка/удаление изображений

### Шаг 3: Лобби (REST + Redis)
- [x] Создание лобби с генерацией кода
- [x] Присоединение игрока
- [x] Получение информации о лобби
- [x] Хранение в Redis

### Шаг 4: WebSocket + Игровой процесс
- [x] Настройка STOMP
- [x] Подключение к лобби через WS
- [x] Отправка вопросов
- [x] Приём ответов
- [x] Таймер
- [x] Подсчёт очков

### Шаг 5: Фронтенд — Хост
- [ ] Страница создания лобби
- [ ] Страница ожидания с списком игроков
- [ ] Страница игры с вопросом и таймером
- [ ] Страница результатов

### Шаг 6: Фронтенд — Игрок
- [ ] Страница подключения (код + имя)
- [ ] Страница ожидания
- [ ] Страница ответа (4 кнопки)
- [ ] Страница результатов

### Шаг 7: Фронтенд — Редактор
- [ ] Список тем
- [ ] Создание/редактирование темы
- [ ] Создание/редактирование вопроса
- [ ] Загрузка изображений

### Шаг 8: Полировка
- [ ] Адаптивный дизайн
- [ ] Обработка ошибок
- [ ] Анимации
- [ ] Тестирование

---

## Полезные команды

### Тестовые данные
- `.data/files_for_testing/` — картинки для тестирования загрузки изображений:
  - `belive.png`
  - `weather.png`

### Backend

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
```

### Docker
```bash
docker compose up -d            # запустить всё
docker compose down             # остановить
docker compose logs -f backend  # логи бэкенда
```
