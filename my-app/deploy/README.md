# Деплой на свой сервер (VPS)

Файлы в этой папке — шаблоны для `systemd` и `nginx`. Отредактируйте пути/домен под себя, они не применяются автоматически.

Если нужен буквальный чек-лист команд по порядку — см. [`DEPLOY_STEPS.md`](./DEPLOY_STEPS.md). Этот файл — сжатое обоснование, что и зачем настроено.

## 1. Непривилегированный пользователь

```bash
sudo useradd --system --home /opt/neoconf --shell /usr/sbin/nologin neoconf
sudo mkdir -p /opt/neoconf/my-app
sudo chown -R neoconf:neoconf /opt/neoconf
```

Приложение и `node_modules` разворачиваются в `/opt/neoconf/my-app` от имени `neoconf`, без sudo и без интерактивного шелла.

## 2. `.env`

Создайте `/opt/neoconf/my-app/.env` (владелец `neoconf`, права `600`):

```env
DATABASE_URL="postgresql://app:<пароль>@127.0.0.1:5433/appdb?schema=public"
SESSION_SECRET="<случайная строка не короче 32 символов>"
UPLOAD_DIR="storage/uploads/articles"
SESSION_TTL_DAYS="7"
SUPERADMIN_EMAIL="you@example.com"
SUPERADMIN_PASSWORD="<надёжный пароль, задать один раз>"
PORT="3000"
```

`SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` читает `prisma/seed.mjs` — при первом запуске (или рестарте, если такого пользователя ещё нет) создаст/повысит этого пользователя до `SUPERADMIN`. Дальше управлять ролями остальных можно из `/admin` → «Управление пользователями», заходя под этим аккаунтом. Смените `SUPERADMIN_PASSWORD` в `.env` не приведёт к смене пароля существующего пользователя — только к созданию нового, если email ещё не занят.

## 3. Postgres

`docker-compose.yml` уже биндит Postgres на `127.0.0.1:5433` — снаружи он не виден. Если Postgres не в докере, а нативный — убедитесь, что в `postgresql.conf` `listen_addresses = 'localhost'`, и что `pg_hba.conf` не разрешает подключения `0.0.0.0/0`.

## 4. systemd

См. [`neoconf.service`](./neoconf.service) — комментарии в начале файла описывают шаги установки. Юнит:

- запускается от `neoconf`, без новых привилегий;
- имеет доступ на запись только к `storage/` и `.next/cache`, остальная ФС — read-only (`ProtectSystem=strict`);
- ограничен по памяти (`MemoryMax=1G`) и CPU (`CPUQuota=150%`) — упавший в перегрузку процесс не должен укладывать всю машину;
- автоматически перезапускается при падении (`Restart=on-failure`), но с лимитом попыток, чтобы не маскировать реальную проблему бесконечным рестартом.

Значения `MemoryMax`/`CPUQuota` — отправная точка, подгоните под реальные ресурсы сервера.

## 5. nginx

См. [`nginx.conf`](./nginx.conf) и [`proxy_params_neoconf`](./proxy_params_neoconf). Настроен:

- `client_max_body_size 11m` — синхронизировано с лимитом загрузки статьи в 10 МБ на уровне приложения;
- `limit_req` отдельно и строже для `/api/auth/login` и `/api/auth/register` (защита от брутфорса/спама регистраций на уровне прокси, до того как запрос дойдёт до Node);
- TLS — через `certbot --nginx -d your-domain.example` после того, как базовый конфиг на 80 порту заработает.

## 6. Firewall

```bash
sudo ufw default deny incoming
sudo ufw allow OpenSSH   # либо ваш нестандартный SSH-порт
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Порт Node (3000) и Postgres (5433) наружу не открываются — они видны только на `127.0.0.1`, `ufw` их и не должен пропускать.

## 7. Старый сервер / cron

Если это переезд на новый сервер после инцидента — **не переносите** старые `crontab`, `systemd`-юниты или ключи SSH вручную. Поднимайте окружение с нуля по этому чек-листу, а на новом сервере после разворачивания проверьте:

```bash
sudo crontab -l -u neoconf
sudo crontab -l -u root
for u in $(cut -f1 -d: /etc/passwd); do sudo crontab -l -u "$u" 2>/dev/null && echo "^ user: $u"; done
systemctl list-timers --all
```
