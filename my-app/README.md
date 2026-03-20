# NeoConf

Платформа управления научными конференциями на `Next.js 15` с реальным бэкендом, `PostgreSQL`, `Prisma`, авторизацией по сессии и ролевыми кабинетами.

## Что реализовано

- Регистрация и вход пользователей с ролями: `participant`, `reviewer`, `section-chair`, `admin`
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
```

## Роли и сценарии

- `admin`: создаёт конференции и назначает представителей секций
- `participant`: регистрируется на конференцию и отправляет статью
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

Для Render уже добавлен [render.yaml](/Users/user/Documents/dev/NeoConf/my-app/render.yaml) и стартовый скрипт [scripts/start-prod.sh](/Users/user/Documents/dev/NeoConf/my-app/scripts/start-prod.sh).

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
