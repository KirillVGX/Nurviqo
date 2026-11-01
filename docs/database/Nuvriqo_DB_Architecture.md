# АРХІТЕКТУРА БАЗИ ДАНИХ

Helpdesk SaaS · Проєкт №18 · Версія 2.0 · Листопад 2026

PostgreSQL · FastAPI · SQLAlchemy 2.0 async · Alembic

Статус: проєктна специфікація, не реалізована схема. Назви таблиць, полів, типів та індексів наведено англійською мовою.

## 1. Призначення та межі

База даних підтримує multi-tenant Helpdesk: організації, облікові записи, членство та ролі, клієнтів, канали, тикети, повідомлення, вкладення, події й сповіщення. Для відповідності технічній архітектурі v2.0 також передбачені idempotency_keys, refresh_sessions і outbox_events. Redis, Celery, AI та платежі не є таблицями ядра MVP.

## 2. Принципи моделювання

Первинні ключі — UUID; часові значення — timestamptz (UTC); змінні довідникові статуси — varchar + CHECK або PostgreSQL ENUM, рішення фіксується в міграціях. Кожна tenant-owned сутність має organization_id. Для критичних зв’язків застосовуються складені FK (organization_id, id), щоб уникнути міжорганізаційних посилань. Видалення записів аудиту заборонене в штатному UI. Секрети інтеграцій зберігаються зашифрованими.

Зв’язок M:N між users та organizations реалізовано через memberships. Організаційні ролі: owner, admin, agent, viewer. Відповідність 3НФ: дані користувача, організації та клієнта винесено в окремі сутності; повторювані відношення реалізовані FK. Винятки (наприклад, snapshot в event payload) обґрунтовані аудитом.

## 3. Словник таблиць

### organizations

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| name | varchar(160) NOT NULL | Назва |
| slug | varchar(100) UNIQUE NOT NULL | URL slug |
| created_at | timestamptz NOT NULL | Створення |

### users

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| email | varchar(255) UNIQUE NOT NULL | Email у нормалізованому регістрі |
| password_hash | text NOT NULL | Argon2id hash |
| full_name | varchar(160) NOT NULL | Ім’я |
| is_active | boolean NOT NULL DEFAULT true | Активність |
| created_at | timestamptz NOT NULL | Створення |

### memberships

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор членства |
| organization_id | uuid FK NOT NULL | Організація |
| user_id | uuid FK NOT NULL | Користувач |
| role | varchar(20) NOT NULL | owner/admin/agent/viewer |
| is_active | boolean NOT NULL DEFAULT true | Доступ |

### departments

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| name | varchar(120) NOT NULL | Назва відділу |

### customers

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| name | varchar(160) NOT NULL | Ім’я клієнта |
| email | varchar(255) NULL | Email |
| phone | varchar(40) NULL | Телефон |
| created_at | timestamptz NOT NULL | Створення |

### channels

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| type | varchar(30) NOT NULL | telegram/web/email |
| name | varchar(120) NOT NULL | Назва каналу |
| config_encrypted | text NULL | Зашифрована конфігурація |

### customer_identities

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| customer_id | uuid FK NOT NULL | Клієнт |
| channel_id | uuid FK NOT NULL | Канал |
| external_user_id | varchar(255) NOT NULL | Зовнішній ID |

### tickets

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| customer_id | uuid FK NOT NULL | Клієнт |
| channel_id | uuid FK NULL | Канал |
| department_id | uuid FK NULL | Відділ |
| assigned_membership_id | uuid FK NULL | Призначений учасник |
| subject | varchar(255) NOT NULL | Тема |
| status | varchar(24) NOT NULL | open/in_progress/pending/resolved/closed |
| priority | varchar(16) NOT NULL | low/normal/high/urgent |
| created_at | timestamptz NOT NULL | Створення |
| updated_at | timestamptz NOT NULL | Оновлення |
| resolved_at | timestamptz NULL | Вирішення |

### messages

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| ticket_id | uuid FK NOT NULL | Тикет |
| author_user_id | uuid FK NULL | Автор-співробітник |
| author_customer_id | uuid FK NULL | Автор-клієнт |
| kind | varchar(20) NOT NULL | reply/internal_note/system |
| body | text NOT NULL | Повідомлення |
| external_message_id | varchar(255) NULL | ID у каналі |
| channel_id | uuid FK NULL | Канал зовнішнього повідомлення |
| created_at | timestamptz NOT NULL | Створення |

### attachments

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| message_id | uuid FK NOT NULL | Повідомлення |
| storage_key | text NOT NULL | S3 key |
| file_name | varchar(255) NOT NULL | Назва файлу |
| mime_type | varchar(120) NOT NULL | MIME |
| size_bytes | bigint NOT NULL | Розмір |

### ticket_events

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| ticket_id | uuid FK NOT NULL | Тикет |
| actor_user_id | uuid FK NULL | Ініціатор |
| event_type | varchar(50) NOT NULL | Тип зміни |
| payload | jsonb NOT NULL | Деталі |
| created_at | timestamptz NOT NULL | Час |

### notifications

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| user_id | uuid FK NOT NULL | Одержувач |
| ticket_id | uuid FK NULL | Тикет |
| type | varchar(40) NOT NULL | Тип |
| read_at | timestamptz NULL | Прочитання |
| created_at | timestamptz NOT NULL | Створення |

### idempotency_keys

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| key | varchar(160) NOT NULL | Ключ запиту |
| request_hash | varchar(64) NOT NULL | SHA-256 від canonical request |
| response_status | integer NULL | HTTP status |
| response_body | jsonb NULL | Відповідь |
| state | varchar(20) NOT NULL | processing/completed |
| created_at | timestamptz NOT NULL | Створення |
| expires_at | timestamptz NOT NULL | TTL |

### refresh_sessions

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| user_id | uuid FK NOT NULL | Користувач |
| token_hash | varchar(255) UNIQUE NOT NULL | Хеш refresh token |
| expires_at | timestamptz NOT NULL | Термін |
| revoked_at | timestamptz NULL | Відкликання |
| created_at | timestamptz NOT NULL | Створення |

### outbox_events

| Поле | Тип / ключ | Призначення |
| --- | --- | --- |
| id | uuid PK | Ідентифікатор |
| organization_id | uuid FK NOT NULL | Організація |
| event_type | varchar(80) NOT NULL | Подія |
| aggregate_id | uuid NOT NULL | Сутність |
| payload | jsonb NOT NULL | Дані |
| published_at | timestamptz NULL | Опубліковано |
| attempts | integer NOT NULL DEFAULT 0 | Повторні спроби |
| created_at | timestamptz NOT NULL | Створення |

## 4. Зв’язки та інваріанти

organizations 1:N memberships, departments, customers, channels, tickets; users 1:N memberships та refresh_sessions; customers 1:N tickets; tickets 1:N messages і ticket_events; messages 1:N attachments. memberships ↔ tickets: 1:N за assigned_membership_id.

Для всіх tenant-owned таблиць: UNIQUE (organization_id, id) як ціль складених FK. tickets.customer_id, tickets.channel_id, tickets.department_id та tickets.assigned_membership_id перевіряються складеними FK на відповідні (organization_id, id). Аналогічно для messages.ticket_id, messages.author_customer_id, attachments.message_id та інших tenant-зв’язків. memberships.user_id — глобальний FK на users. notifications.user_id також перевіряється через активне membership у сервісному шарі або змінюється на membership_id у фінальній схемі.

messages: для reply/internal_note має бути рівно один автор; system може мати нуль авторів. internal_note ніколи не передається в зовнішній канал. external_message_id разом із channel_id має унікальний індекс (partial WHERE external_message_id IS NOT NULL).

## 5. Індекси та обмеження

| Об’єкт | Індекс / обмеження |
| --- | --- |
| memberships | UNIQUE (organization_id, user_id); CHECK role IN (owner, admin, agent, viewer) |
| departments | UNIQUE (organization_id, name) |
| customer_identities | UNIQUE (channel_id, external_user_id) |
| tickets | INDEX (organization_id, status, created_at DESC, id DESC) |
| tickets | INDEX (organization_id, assigned_membership_id, status) |
| messages | INDEX (ticket_id, created_at); UNIQUE (channel_id, external_message_id) WHERE external_message_id IS NOT NULL |
| ticket_events | INDEX (ticket_id, created_at) |
| idempotency_keys | UNIQUE (organization_id, key); INDEX (expires_at) |
| outbox_events | INDEX (published_at, created_at) |
| attachments | CHECK (size_bytes &gt;= 0) |
| tickets | CHECK для status і priority; FK з tenant scope |

Пошук за subject/body на MVP можна реалізувати через PostgreSQL full-text search із GIN-індексом; для демонстрації продуктивності порівняти EXPLAIN ANALYZE до та після індексування. Сортування тикетів: created_at DESC, id DESC; page_size 1–100.

## 6. Конкурентна операція claim

POST /api/v1/organizations/{organization_id}/tickets/{ticket_id}/claim. Перед операцією сервер перевіряє активне membership та роль agent/admin/owner. В одній транзакції виконується атомарне призначення та вставка ticket_events і outbox_events. Якщо рядок не оновлено — 409 Conflict або 404 для прихованого ресурсу.

```sql
UPDATE tickets
SET assigned_membership_id = :membership_id,
    status = 'in_progress', updated_at = now()
WHERE id = :ticket_id
  AND organization_id = :organization_id
  AND assigned_membership_id IS NULL
  AND status = 'open'
RETURNING id;
```

Перевірка race: 2 одночасні транзакції, рівно 1 успішний claim, 1 conflict, 1 ticket_event; після commit подія доставляється через outbox. Повторне створення тикета з тим самим Idempotency-Key та тим самим request_hash повертає збережений результат; з іншим hash — 409. Захоплення ключа має бути атомарним через UNIQUE і транзакцію.

## 7. Міграції, seed та тестування

Міграції Alembic — єдине джерело змін схеми. Seed: ≥2 organizations, 12 users, 20 memberships, 300 tickets, 600 messages, 100 ticket_events. Seed повторюваний без дублювання. Integration tests із реальною PostgreSQL: FK tenant isolation, unique external_message, role constraints, concurrent claim, idempotency, rollback при помилці event insert. Окремо перевірити резервне копіювання та відновлення.

## 8. ER-діаграма та документація

Окремий файл Helpdesk_ER_Diagram_v2.mmd містить схему зв’язків. Для пояснювальної записки діаграму слід експортувати в зображення та вставити з підписом. Словник полів у цьому документі є проєктним; точні nullable/default/on delete налаштування мають бути відображені у міграціях і SQLAlchemy моделях.

## 9. Узгодження з технічною архітектурою v2.0

Назва FK виконавця: assigned_membership_id (не assigned_to_id). REST /api/v1, OpenAPI 3.1, RFC 9457, Idempotency-Key, outbox, audit, tenant isolation, 300+ seed tickets та PostgreSQL concurrency tests узгоджені з технічною документацією. Для refresh token додано refresh_sessions; для створення тикетів — idempotency_keys.

## 10. Відповідність методичним рекомендаціям

Реалізовано у проєкті схеми: ≥4 пов’язані сутності, M:N users ↔ organizations, ≥2 ролі, конкурентна операція, пагінація на 200+ записах, ER-модель, фізична модель та індекси. Фактичні результати міграцій, тести й EXPLAIN ANALYZE додаються після програмної реалізації. Джерело: Северин М. В., «Методичні рекомендації до виконання курсового проєкту з дисципліни Веб-технології та веб-дизайн», ДУІТЗ, 2025.
