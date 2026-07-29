# NeoConf

Платформа управления научными конференциями на `Next.js 15` с реальным бэкендом, `PostgreSQL`, `Prisma`, авторизацией по сессии и ролевыми кабинетами.

## Что реализовано

- Регистрация и вход пользователей с ролями: `participant`, `reviewer`, `section-chair`, `admin` (роль `superadmin` при саморегистрации недоступна — назначается только другим суперадминистратором)
- Cookie-based сессии
- Создание конференций администратором
- Назначение представителей секций
- Регистрация участника на конференцию
- Загрузка статьи с сохранением файла на диск и метаданных в БД
- Назначение рецензентов председателем секции
- Сохранение и обновление рецензий рецензентом
- API routes в `src/app/api`
- Клиентские MobX store'ы, работающие поверх API, а не in-memory данных

## Стек

- `Next.js 15`
- `React 19`
- `MobX`
- `Prisma`
- `PostgreSQL`
- `Zod`

## Подготовка

1. Скопируйте `.env.example` в `.env`.
2. Поднимите Postgres:

```bash
docker compose up -d
```

3. Сгенерируйте Prisma client:

```bash
npm run prisma:generate
```

4. Примените схему:

```bash
npm run prisma:db:push
```

5. Заполните стартовыми данными:

```bash
npm run prisma:seed
```

6. Запустите проект:

```bash
npm run dev
```

## Переменные окружения

```env
DATABASE_URL="postgresql://app:app@localhost:5433/appdb?schema=public"
SESSION_SECRET="change-this-to-a-long-random-string-with-at-least-32-characters"
UPLOAD_DIR="storage/uploads/articles"
SESSION_TTL_DAYS="7"
# Опционально: если заданы обе переменные, prisma/seed.mjs идемпотентно
# создаст (или повысит существующего) пользователя с ролью SUPERADMIN.
SUPERADMIN_EMAIL="you@example.com"
SUPERADMIN_PASSWORD="change-this"
```

## Роли и сценарии

- `superadmin`: то же, что и `admin`, плюс единственный, кто может назначать/снимать любые роли другим пользователям (включая понижение `admin` до `participant`) через `/admin` → «Управление пользователями». Не выдаётся через форму регистрации — только через `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` при первом сиде или другим суперадминистратором.
- `admin`: создаёт конференции и назначает представителей секций
- `participant`: регистрируется на конференцию и отправляет статью (файл до 10 МБ, PDF/DOC/DOCX)
- `section-chair`: назначает рецензентов, но только для закреплённых за ним секций
- `reviewer`: оставляет рецензии только по назначенным статьям

## Файлы статей

Загруженные статьи сохраняются в директорию `storage/uploads/articles`. Эта папка добавлена в `.gitignore`.

## Проверка

Проверки, которые были успешно пройдены в этой среде:

```bash
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
npm run prisma:generate
npm run prisma:db:push
npm run prisma:seed
DATABASE_URL=... SESSION_SECRET=... ./node_modules/.bin/next build
```

## Деплой

Самый быстрый путь для текущей архитектуры: `Render` с `Render Postgres` и persistent disk.

Почему не `Vercel` в текущем виде:

- приложение сохраняет загруженные файлы статей локально
- у Vercel Functions запись файлов лучше выносить в object storage, а не в локальную файловую систему

Для Render уже добавлен [render.yaml](./render.yaml) и стартовый скрипт [scripts/start-prod.sh](./scripts/start-prod.sh).

Что делать:

1. Запушить репозиторий в GitHub.
2. В Render выбрать `New > Blueprint`.
3. Подключить репозиторий и подтвердить `render.yaml`.
4. Дождаться первого деплоя.

Blueprint уже задаёт:

- web service на Node.js
- Render Postgres и проброс `DATABASE_URL` из базы
- persistent disk, смонтированный в `/opt/render/project/src/storage`
- автогенерацию `SESSION_SECRET`
- старт через `prisma db push`, idempotent seed и `next start`

Текущее ограничение такого прод-решения:

- один инстанс приложения
- локальное файловое хранилище
- файловое хранилище всё ещё локальное, поэтому сервис остаётся привязанным к одному диску

Если после первого прод-выката захотим сделать нормальную боевую архитектуру, следующий шаг:

- вынести файлы в S3/Blob-совместимое хранилище
- тогда уже можно спокойно ехать на Vercel/Railway/Render без привязки к одному диску

### Деплой на свой сервер (VPS)

Если разворачиваете вручную на своём сервере — используйте шаблоны в [`deploy/`](./deploy): `neoconf.service` (hardened systemd-юнит, непривилегированный пользователь, лимиты памяти/CPU) и `nginx.conf` (реверс-прокси, лимит размера тела запроса, rate limiting на `/api/auth/*`). Подробности и чек-лист — в [`deploy/README.md`](./deploy/README.md).

## Безопасность

Что уже сделано в коде:

- Пароли — `scrypt` с солью, сравнение через `timingSafeEqual`.
- Сессии — случайный токен, в БД хранится только его хэш, cookie `httpOnly`/`sameSite=lax`/`secure` в проде.
- Все запросы к БД идут через Prisma с параметрами (SQL-инъекций нет).
- Регистрация не позволяет выдать себе роль `superadmin` — только `participant`/`reviewer`/`section-chair`/`admin`; изменение чужих ролей требует существующего `SUPERADMIN` (см. `/admin` → «Управление пользователями»).
- `/api/app-state` требует авторизации (раньше отдавал все данные без неё).
- Загрузка статьи ограничена по расширению (`.pdf/.doc/.docx`) и размеру (10 МБ).
- In-memory rate limiting на `/api/auth/login` (10/5 мин), `/api/auth/register` (5/час), загрузку статьи (10/час) и `/api/app-state` (30/мин) — на уровне процесса; для нескольких инстансов нужен внешний rate limiter (Redis) вместо `src/lib/rate-limit.ts`.

Что нужно обеспечить на инфраструктуре (см. [`deploy/README.md`](./deploy/README.md)):

- Postgres не должен быть доступен снаружи (в `docker-compose.yml` уже забинден на `127.0.0.1`).
- Процесс приложения — от непривилегированного пользователя, без sudo.
- `nginx`/firewall перед Node — TLS, `client_max_body_size`, дополнительный `limit_req`.
- Регулярно обновлять `next`/зависимости — `npm audit` и `npm outdated` перед каждым релизом.
