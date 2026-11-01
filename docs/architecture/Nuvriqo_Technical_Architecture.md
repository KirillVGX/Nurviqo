# ТЕХНІЧНА ДОКУМЕНТАЦІЯ

Helpdesk SaaS — система керування зверненнями клієнтів

Версія документа: 1.0  \|  Статус: проєктування  \|  Листопад 2026

Стек: Next.js · TypeScript · FastAPI · PostgreSQL

Призначення: курсова робота з вебпрограмування та основа майбутнього SaaS-продукту.

## 1. Опис та концепція проєкту

Helpdesk SaaS — багатокористувацька вебплатформа для централізованого приймання, розподілу та опрацювання звернень клієнтів (tickets). Організації створюють окремі робочі простори, запрошують операторів і контролюють якість підтримки. Перший зовнішній канал інтеграції — Telegram Bot; у наступних версіях можливі email та чат-віджет.

### 1.1. Проблема та цінність

Малі команди часто обробляють звернення у різних месенджерах без єдиного статусу, відповідального виконавця та історії. Продукт об’єднує комунікацію, дозволяє уникнути дублювання роботи та вимірювати швидкість відповіді.

### 1.2. Цільова аудиторія

- Невеликі інтернет-магазини та сервісні центри.
- Ремонтні компанії, локальні послуги та агентства.
- Команди підтримки цифрових продуктів та освітніх платформ.

### 1.3. Межі MVP

MVP: організації, ролі, тикети, повідомлення, призначення оператора, історія подій, пошук, базова аналітика та Telegram. AI, платежі та багатоканальна інтеграція — окремі етапи розвитку.

## 2. Функціональні вимоги

| Модуль | Можливості | Пріоритет |
| --- | --- | --- |
| Authentication | Реєстрація, вхід, refresh, logout, reset password | MVP |
| Organizations | Створення workspace, запрошення, membership, ролі | MVP |
| Tickets | CRUD, статуси, пріоритет, черга, призначення, фільтри | MVP |
| Messages | Відповіді, внутрішні нотатки, вкладення | MVP |
| Audit | Історія змін статусів і виконавців | MVP |
| Analytics | Кількість тикетів, час відповіді, навантаження | MVP |
| Telegram | Webhook, вхідні/вихідні повідомлення | MVP+ |
| Realtime | Події нових тикетів та повідомлень | MVP+ |
| Automation | SLA, правила маршрутизації, сповіщення | V2 |
| AI Assistant | Чернетки відповідей, класифікація, summary | V2 |
| Billing | Плани, ліміти, оплата, invoices | V3 |

## 3. Нефункціональні вимоги

- Ізоляція даних між організаціями (tenant isolation) на рівні кожного запиту.
- Атомарне призначення тикета: лише один оператор може успішно взяти вільний тикет.
- Валідація даних, контроль прав доступу, журналювання критичних подій.
- Пагінація списків, індекси для типових фільтрів, моніторинг помилок.
- Резервне копіювання PostgreSQL, міграції та відновлення даних.
- Доступність інтерфейсу на десктопі й мобільних пристроях.

## 4. Технологічний стек

| Рівень | Технології | Призначення |
| --- | --- | --- |
| Frontend | Next.js (App Router), React, TypeScript | Інтерфейс, маршрути, SSR за потреби |
| UI | Tailwind CSS, shadcn/ui, React Hook Form, Zod | Компоненти та форми |
| Client state | TanStack Query, Zustand | Серверний кеш і локальний UI state |
| Backend | Python, FastAPI, Pydantic v2 | REST API, бізнес-логіка, валідація |
| Persistence | PostgreSQL, SQLAlchemy 2 async, asyncpg | Транзакційні дані |
| Migrations | Alembic | Контроль версій схеми БД |
| Auth | JWT access + rotating refresh tokens | Керування сесіями |
| Realtime | FastAPI WebSockets | Push-події клієнтам |
| Background | Redis, Celery | Черги, повторні спроби, планові задачі |
| Telegram | aiogram або HTTP Bot API | Webhook та відправлення повідомлень |
| Files | S3-compatible storage / MinIO | Вкладення |
| Infrastructure | Docker Compose, Nginx, HTTPS | Локальний запуск та VPS |
| Testing | pytest, httpx, Playwright | Backend та E2E перевірки |

Принцип: модульний моноліт. Celery, Redis, S3 та AI не є обов’язковими для найпершої демонстрації; їх можна додавати поступово.

## 5. Загальна архітектура

Браузер → Next.js UI → FastAPI REST/WebSocket → application services → SQLAlchemy → PostgreSQL. FastAPI також приймає Telegram webhook; важкі або повторювані задачі передає до Celery через Redis. Файли зберігаються окремо у S3-compatible storage.

### 5.1. Межі відповідальності

- Next.js: маршрути, UI, форми, відображення списків, підключення WebSocket; не є джерелом бізнес-правил.
- FastAPI: авторизація, права, tenant isolation, бізнес-операції, API, валідація.
- PostgreSQL: транзакційна цілісність, унікальність, зв’язки, блокування.
- Redis/Celery: асинхронні нотифікації, обробка webhook, SLA jobs.

### 5.2. Середовища

development: Docker Compose з PostgreSQL і Redis; staging: окремі ключі та БД; production: HTTPS, ізольовані секрети, backup, централізовані логи.

## 6. Структура репозиторію

Рекомендовано monorepo:

```text
helpdesk/
  frontend/ — Next.js App Router, components, features, lib, hooks
  backend/ — FastAPI application
    app/api/v1/ — routers
    app/core/ — config, security, database
    app/models/ — SQLAlchemy models
    app/schemas/ — Pydantic DTO
    app/repositories/ — DB access
    app/services/ — use cases та бізнес-правила
    app/integrations/ — telegram, ai, email
    app/workers/ — Celery tasks
    alembic/ — міграції
    tests/ — unit та integration tests
  infra/ — compose, nginx, deployment
  docs/ — API, ADR, ERD, diagrams
  .env.example — шаблон конфігурації

```

## 7. Модель даних та ключові зв’язки

Детальну схему полів і ER-діаграму наведено в окремому документі «Архітектура бази даних». Тут описано логічні модулі та інваріанти; перед міграціями слід синхронізувати остаточні назви таблиць з ERD.

| Сутність | Призначення |
| --- | --- |
| users | Глобальні облікові записи |
| organizations | Робочі простори компаній |
| memberships | Зв’язок users ↔ organizations, роль та статус |
| tickets | Звернення, статус, пріоритет, виконавець, tenant |
| messages | Публічні відповіді та внутрішні нотатки |
| ticket_events | Аудит переходів та змін |
| attachments | Метадані файлів та storage keys |
| channels | Підключення Telegram / інших каналів |
| contacts | Клієнти всередині організації |
| notifications | Сповіщення операторів |
| refresh_sessions | Сесії та відкликання refresh токенів |
| automation_rules | Правила майбутньої автоматизації |

### 7.1. Обов’язкові інваріанти

- Усі tenant-owned записи містять organization_id; доступ дозволено лише активному membership.
- Зв’язки ticket → contact / assignee / channel перевіряються в межах тієї самої організації.
- Внутрішні нотатки не надсилаються клієнту через зовнішні канали.
- Зовнішні повідомлення мають deduplication key (channel_id, external_message_id).
- Видалення важливих записів — через soft delete або чітку retention policy.

## 8. Авторизація та RBAC

| Роль | Основні права |
| --- | --- |
| owner | Керує організацією, учасниками, каналами та тарифом |
| admin | Керує операторами, налаштуваннями та всіма тикетами |
| agent | Працює з дозволеними тикетами, повідомленнями |
| viewer | Перегляд доступних даних без редагування |

Access token короткоживучий; refresh token зберігати у вигляді hash в БД, ротувати та відкликати. Для browser-based сесій використовувати Secure, HttpOnly, SameSite cookies з належним CSRF-захистом. Перевіряти роль на сервері в кожній операції.

## 9. REST API (попередній контракт)

| Метод | Endpoint | Опис |
| --- | --- | --- |
| POST | /api/v1/auth/login | Вхід |
| POST | /api/v1/auth/refresh | Оновлення сесії |
| GET | /api/v1/organizations | Організації користувача |
| POST | /api/v1/organizations | Створення workspace |
| GET | /api/v1/organizations/{org_id}/tickets | Список тикетів |
| POST | /api/v1/organizations/{org_id}/tickets | Створення тикета |
| GET | /api/v1/organizations/{org_id}/tickets/{id} | Деталі тикета |
| POST | /api/v1/organizations/{org_id}/tickets/{id}/claim | Атомарне взяття в роботу |
| PATCH | /api/v1/organizations/{org_id}/tickets/{id} | Зміна атрибутів |
| POST | /api/v1/organizations/{org_id}/tickets/{id}/messages | Повідомлення / нотатка |
| GET | /api/v1/organizations/{org_id}/analytics/overview | Огляд метрик |
| POST | /api/v1/webhooks/telegram/{channel_id} | Вхідний Telegram webhook |

Відповіді: 200/201 — успіх, 400 — некоректні дані, 401 — немає сесії, 403 — немає прав, 404 — ресурс недоступний, 409 — конфлікт конкурентної операції, 422 — помилка валідації. Пагінація: cursor або limit/offset з явним сортуванням.

## 10. Конкурентне взяття тикета в роботу

Ключова вимога курсової: два оператори не повинні одночасно отримати один вільний тикет. Використовувати атомарний UPDATE ... WHERE assigned_membership_id IS NULL ... RETURNING id в одній транзакції. Додатково обмежити запит organization_id і дозволеними статусами.

При успіху: оновити assigned_membership_id/status, створити ticket_event, commit; після commit надіслати WebSocket-подію. Якщо UPDATE не повернув рядок — повернути 409 або 404 залежно від прав і стану. Перевірити паралельним інтеграційним тестом.

## 11. Real-time та фонові процеси

WebSocket endpoint: /api/v1/ws/organizations/{org_id}. Під час handshake перевіряти сесію та membership; повторно перевіряти доступ до конкретного тикета. Події: ticket.created, ticket.updated, ticket.claimed, message.created, notification.created. Після reconnect клієнт повторно отримує стан через REST; WebSocket не є джерелом істини.

Celery tasks: надсилання повідомлень у Telegram, email-нотифікації, SLA-перевірки, AI-підказки. Для зовнішніх webhook — idempotency, retry з backoff, контроль дублювання. Для надійної доставки після DB commit у майбутньому додати transactional outbox.

## 12. Telegram інтеграція

- Адміністратор підключає Telegram Bot token; токен зберігати зашифрованим та ніколи не повертати в API.
- Telegram надсилає webhook; сервер перевіряє секретний заголовок та channel_id.
- За external_chat_id визначається contact; за потреби створюється ticket.
- Вхідне повідомлення зберігається з унікальним external_message_id.
- Відповідь оператора ставиться в чергу на надсилання, статус доставки фіксується.

## 13. Безпека та приватність

- HTTPS, CORS лише для довірених origin, rate limiting для auth та webhook.
- Паролі: Argon2id, без зберігання plaintext; секрети — лише через environment/secret manager.
- Перевірка tenant scope для всіх queries та download URL вкладень.
- Обмеження типів/розмірів файлів, антивірусна перевірка за потреби.
- Журнали без паролів, токенів, персональних повідомлень; retention policy.
- Резервні копії, тест відновлення, міграції без втрати даних.

## 14. Тестування та критерії приймання

- Unit: переходи статусів, permissions, SLA-обчислення.
- Integration: API + реальна PostgreSQL, міграції, tenant isolation.
- Concurrency: два одночасні POST /claim → рівно один успіх.
- E2E: login → ticket → claim → reply → resolve.
- Webhook: дубль повідомлення не створює другий запис.
- Security: оператор організації A не бачить тикети B.

## 15. Деплой та експлуатація

Docker Compose: frontend, api, postgres, redis, worker, nginx. На production — окремі volumes, TLS, health checks, restart policies, backup schedule. CI: lint, typecheck, tests, migrations check, build. Спостережуваність: structured logs, request_id, health endpoints /health/live та /health/ready, error tracking.

## 16. План реалізації

| Етап | Результат |
| --- | --- |
| 1. Foundation | Monorepo, Docker, PostgreSQL, Alembic, auth |
| 2. Core | Organizations, memberships, tickets, RBAC |
| 3. Concurrency | Claim, ticket_events, паралельні тести |
| 4. Communication | Messages, attachments, notifications, WebSocket |
| 5. Integration | Telegram webhook, reply, idempotency |
| 6. Analytics | Dashboard, фільтри, базові KPI |
| 7. Launch | CI/CD, security review, backup, staging |
| 8. Growth | AI, SLA automation, billing, інші канали |

## 17. Ризики та архітектурні рішення

| Ризик | Мітигація |
| --- | --- |
| Надмірна складність MVP | Спочатку модульний моноліт і один канал |
| Витік між tenant | organization_id у кожній операції, security tests |
| Дублікати webhook | Унікальний зовнішній ID та idempotency |
| Конфлікт призначення | Atomic UPDATE + integration test |
| Втрата повідомлення | Retries, delivery state, згодом outbox |
| Обмеження сторонніх API | Офіційні API, перевірка доступів і квот |

## 18. Результат курсової роботи

Працюючий вебзастосунок із ролями, кількома організаціями, чергою звернень, перепискою, аудитом, аналітикою та перевіреною конкурентною операцією claim. До комплекту здачі: вихідний код, ERD, OpenAPI schema, інструкція запуску, демонстраційні дані та тести.

Примітка: це проєктна документація версії 1.0. Точний API та структура БД уточнюються після погодження сценаріїв користувачів і синхронізації з ER-діаграмою.

## 19. Відповідність методичним рекомендаціям (версія 2.0)

Цей розділ уточнює архітектуру відповідно до розділу 5 методичних рекомендацій ДУІТЗ (2025). Він доповнює попередні 18 розділів. Запропоновані рішення є проєктними вимогами, а не підтвердженням уже реалізованого функціоналу.

### 19.1. Архітектурні межі та модулі

Frontend: Next.js (App Router), TypeScript strict, Tailwind CSS, TanStack Query. Backend: FastAPI, Pydantic v2, SQLAlchemy 2 async, Alembic. PostgreSQL — джерело істини. Redis і Celery — опціонально після MVP.

Модульний моноліт: backend/app/modules/{auth,organizations,memberships,tickets,messages,notifications,analytics}/; у кожному модулі — router.py, schemas.py, service.py, repository.py, models.py. Шар service не імпортує FastAPI Request/Response/HTTPException; HTTP-коди визначає router.

Клієнт і сервер спілкуються через HTTPS REST API /api/v1. WebSocket /ws використовується для оновлення стану; всі зміни стану проходять через HTTP API та транзакції PostgreSQL.

### 19.2. OpenAPI 3.1 і типізація клієнта

FastAPI експортує OpenAPI 3.1 у docs/openapi.json; контракт версіонується в Git. CI перевіряє валідність специфікації та відсутність незафіксованих змін.

TypeScript типи та клієнт генеруються із docs/openapi.json (наприклад, openapi-typescript). Ручне дублювання DTO на frontend не допускається. Для кожного маршруту документуються 2xx, 4xx і 5xx відповіді.

Основні маршрути: POST /api/v1/auth/login; GET /api/v1/organizations/{organization_id}/tickets; POST /api/v1/organizations/{organization_id}/tickets; GET /api/v1/organizations/{organization_id}/tickets/{ticket_id}; POST /api/v1/organizations/{organization_id}/tickets/{ticket_id}/claim; POST /api/v1/organizations/{organization_id}/tickets/{ticket_id}/messages.

### 19.3. Формат помилок RFC 9457

Усі API-помилки повертаються з Content-Type: application/problem+json і полями type, title, status, detail, instance. Поле type є стабільним URI, наприклад https://api.example.com/problems/ticket-already-claimed.

400 — некоректний запит; 401 — відсутня автентифікація; 403 — заборонена дія; 404 — ресурс відсутній або прихований через іншу організацію; 409 — конкурентний конфлікт; 422 — помилка валідації; 429 — обмеження частоти; 500 — внутрішня помилка без stack trace. request_id повертається заголовком X-Request-ID.

### 19.4. Конкурентність та ідемпотентність

Операція claim використовує один атомарний UPDATE tickets SET assigned_membership_id=:membership_id, status='in_progress' WHERE id=:ticket_id AND organization_id=:organization_id AND assigned_membership_id IS NULL AND status='open' RETURNING id. Перевірка membership та RBAC виконується на сервері.

Запис ticket_events виконується в тій самій транзакції. Якщо UPDATE не повернув рядок, API повертає 409 або 404 після безпечної перевірки доступності.

Для POST створення тикета використовується Idempotency-Key: таблиця idempotency_keys (organization_id, key, request_hash, response_status, response_body, created_at, expires_at), унікальний індекс (organization_id, key). Повтор того самого запиту повертає збережений результат; інший payload із тим самим ключем — 409.

Тест конкурентності: 2 паралельні оператори, 1 успішне призначення, 1 конфлікт, рівно 1 ticket_event.

### 19.5. Пагінація, фільтрація, дані та індекси

Для списку тикетів MVP використовує offset pagination: page, page_size (1–100), total, items. Підхід обрано для простоти UI; для великих обсягів передбачено cursor pagination. Пошук, сортування й фільтрація виконуються SQL на сервері.

Фільтри: status, priority, assigned_membership_id, created_from, created_to, q. Порядок за created_at DESC, id DESC забезпечує детерміновану видачу.

Сиди: щонайменше 2 організації, 12 користувачів, 20 membership, 300 tickets, 600 messages, 100 ticket_events. Seed-команда має бути повторюваною без дублювання.

Індекси: tickets(organization_id, status, created_at DESC, id DESC); tickets(organization_id, assigned_membership_id, status); messages(ticket_id, created_at). У пояснювальній записці показати EXPLAIN (ANALYZE, BUFFERS) для одного запиту до та після створення індексу.

База нормалізована переважно до 3НФ. Зв’язок M:N users ↔ organizations реалізує memberships. FK призначення в tickets посилається на memberships, а цілісність організації контролюється композитним FK/унікальними ключами або транзакційною перевіркою.

### 19.6. UI/UX, доступність та sitemap

Sitemap: / (landing), /login, /register, /app, /app/tickets, /app/tickets/[id], /app/customers, /app/team, /app/analytics, /app/settings, /404. Для кожного розділу визначити доступні ролі.

Кожен екран з даними має окремі loading, empty, error стани. Інтерфейс без горизонтального скролу від 320 px, Mobile-First; семантичний HTML, один h1, клавіатурна навігація, видимий focus, alt, достатній контраст.

Потрібно додати у курсову графічний sitemap, Use Case Diagram, wireframes desktop/mobile та style guide (кольори, типографіка, кнопки, поля, стани). Це заплановані артефакти, не виконані в цьому документі.

### 19.7. Тестування, CI, спостережуваність

Backend: pytest + pytest-asyncio, інтеграційні тести з PostgreSQL, перевірки RBAC, tenant isolation, idempotency, claim race. Frontend: Vitest/React Testing Library; E2E: Playwright — реєстрація → створення тикета → взяття в роботу → відповідь.

CI GitHub Actions для кожного pull request: backend ruff check/format, pytest; frontend eslint, tsc --noEmit, тести; перевірка OpenAPI та збірка. Міграції Alembic перевіряються на чистій БД.

JSON-логи з level, timestamp, request_id, route, status, duration_ms; X-Request-ID у кожній відповіді. GET /health/live і GET /health/ready. Не логувати паролі, токени, Authorization, вміст приватних повідомлень.

Критерії приймання: серверні перевірки доступу, відсутність дубльованих створень, відтворювані міграції, позитивні E2E і конкурентний тест. Результати тестів та Lighthouse додати після реалізації.

### 19.8. Розгортання, Git та ADR

Docker Compose піднімає frontend, backend, PostgreSQL (Redis — за потреби) однією командою docker compose up -d --build. Nginx завершує TLS. Публічний URL має використовувати дійсний HTTPS-сертифікат.

.env.example містить назви DATABASE_URL, JWT_SECRET, CORS_ORIGINS, NEXT_PUBLIC_API_URL без реальних секретів. Міграції: alembic upgrade head. Резервне копіювання: pg_dump за розкладом; процедура тестового pg_restore документується та перевіряється.

Git: feature-гілки, pull requests, змістовні коміти. ADR у docs/adr/: 0001-modular-monolith.md, 0002-postgresql.md, 0003-ticket-claim-atomic-update.md, 0004-authentication.md. Кожен ADR: контекст, рішення, альтернативи, наслідки.

### 19.9. Артефакти для пояснювальної записки

Окремо від технічної документації підготувати: аналіз 2–3 аналогів зі скриншотами, User Personas, формалізоване ТЗ, Sitemap, ER Diagram, UML Use Case, Sequence Diagram, wireframes, 2–3 блок-схеми алгоритмів, таблицю API, результати тестів, скриншоти UI, CI та deployment, список джерел.

Цей документ — план та технічна специфікація. Він не замінює оформлену за ДСТУ пояснювальну записку й не стверджує, що наведені функції вже розроблено.

## 20. Контрольний список відповідності

- [ ] OpenAPI 3.1 зберігається у Git, типи генеруються
- [ ] RFC 9457 для помилок; приховування чужих ресурсів
- [ ] RBAC та ізоляція організацій перевіряються на сервері
- [ ] Атомарне claim + ticket_events + конкурентний тест
- [ ] Idempotency-Key для створення тикетів
- [ ] 300+ тестових тикетів, пагінація та SQL-фільтрація
- [ ] Міграції Alembic, індекси та EXPLAIN ANALYZE
- [ ] UI від 320 px, доступність, loading/empty/error
- [ ] Модульні тести, E2E, CI на PR
- [ ] JSON-логи, X-Request-ID, health endpoints
- [ ] Docker Compose, HTTPS, .env.example, backup/restore
- [ ] Sitemap, UML, UI макети, ADR, аналіз аналогів

Джерело: Северин М. В. Методичні рекомендації до виконання курсового проєкту з дисципліни «Веб-технології та веб-дизайн». ДУІТЗ, 2025. Розділи 2–7.
