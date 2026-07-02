# Инструкция по деплою на VPS (FirstVDS) с доменом koosmo.ru

> **Важно:** Папка `server/uploads/` теперь отслеживается Git'ом.
> Все фотографии товаров и видео трансляций попадают в репозиторий и корректно деплоятся.

---

## 1. Подготовка на локальном ПК (Windows)

### 1.1 Собрать фронтенд

```powershell
cd client
npm ci
npm run build
```

После сборки в папке `client/build` появятся файлы для продакшена.

### 1.2 Закоммитить и запушить

```powershell
cd ..
git add -A
git commit -m "Обновление сайта"
git push
```

> Папка `server/uploads/` с картинками и видео **включена** в репозиторий.
> База данных `server/database.db` **не включена** (создаётся автоматически).

### 1.3 Перенести БД (первый раз или при обновлении данных)

Скопируйте БД на сервер отдельно:

```powershell
scp server/database.db root@IP_ВАШЕГО_VPS:/var/www/koosmo/server/
```

---

## 2. Настройка VPS (Ubuntu 24.04) — только первый раз

### 2.1 Подключение к серверу

```bash
ssh root@IP_ВАШЕГО_VPS
```

### 2.2 Обновить систему и установить ПО

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nodejs npm build-essential ffmpeg nginx sqlite3
```

Если Node.js старее 18-й версии:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Проверьте версии:

```bash
node --version  # должно быть 18+
npm --version
```

### 2.3 Создать директорию проекта

```bash
sudo mkdir -p /var/www/koosmo
sudo chown -R $USER:$USER /var/www/koosmo
```

---

## 3. Загрузка проекта на сервер (первый раз)

```bash
cd /var/www/koosmo
git clone <ВАШ_РЕПОЗИТОРИЙ> .
```

---

## 4. Установка зависимостей на сервере

```bash
cd /var/www/koosmo/server
npm ci
```

### 4.1 Копирование БД (если есть данные)

```bash
# С локальной машины (PowerShell):
scp server/database.db root@IP_ВАШЕГО_VPS:/var/www/koosmo/server/
```

Если БД нет — она создастся автоматически при первом запуске.

---

## 5. Настройка systemd-сервиса

Создайте файл `/etc/systemd/system/koosmo.service`:

```bash
sudo nano /etc/systemd/system/koosmo.service
```

Вставьте:

```ini
[Unit]
Description=Koosmo Node API
After=network.target

[Service]
WorkingDirectory=/var/www/koosmo/server
ExecStart=/usr/bin/node index.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3001
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Запустите сервис:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now koosmo
sudo systemctl status koosmo
```

Проверьте, что сервер работает:

```bash
curl http://127.0.0.1:3001/
# Должно вернуть: { "ok": true }
```

---

## 6. Настройка Nginx

### 6.1 Создать конфиг сайта

```bash
sudo nano /etc/nginx/sites-available/koosmo
```

Вставьте:

```nginx
server {
    server_name koosmo.ru www.koosmo.ru;

    root /var/www/koosmo/client/build;
    index index.html;

    client_max_body_size 500M;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API, uploads, docs — проксируем на Node
    location ~ ^/(auth|user|settings|products|cart|labs|streams|admin|schedule|appointments|room|stream-room|bowls|bowls-schedule|diagnostics-schedule|courses|guide|bowls-media|activity|uploads|docs) {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

### 6.2 Активировать сайт

```bash
sudo ln -s /etc/nginx/sites-available/koosmo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. Настройка домена koosmo.ru

### 7.1 В панели регистратора домена

Создайте A-записи:
- `koosmo.ru` → `IP_ВАШЕГО_VPS`
- `www.koosmo.ru` → `IP_ВАШЕГО_VPS`

DNS обновится в течение 1-24 часов.

### 7.2 Проверка DNS

```bash
nslookup koosmo.ru
# Должен показать IP вашего VPS
```

---

## 8. SSL сертификат (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d koosmo.ru -d www.koosmo.ru
```

Certbot автоматически:
- Получит SSL сертификат от Let's Encrypt
- Настроит Nginx для HTTPS
- Настроит автообновление сертификата

Откройте фаервол:

```bash
sudo ufw allow 'Nginx Full'
```

---

## 9. Создание администратора

Если в БД нет администратора, создайте его:

```bash
sudo sqlite3 /var/www/koosmo/server/database.db
```

В SQLite:

```sql
-- Посмотреть пользователей
SELECT * FROM users;

-- Сделать пользователя админом (замените 'логин' на реальный логин)
UPDATE users SET isAdmin = 1 WHERE login = 'логин';

-- Или создать нового админа
INSERT INTO users (login, password, isAdmin, fullName, phone, email)
VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3', 1, 'Администратор', '+79000000000', 'admin@koosmo.ru');
-- Пароль: admin (md5 хеш)
.quit
```

---

## 10. Права на папку uploads

```bash
sudo chown -R www-data:www-data /var/www/koosmo/server/uploads
```

---

## 11. Проверка работы

1. Откройте в браузере: `https://koosmo.ru`
2. Проверьте:
   - Фото товаров в магазине
   - Видео-обзоры трансляций
   - Регистрация/авторизация
   - Корзина
   - Запись на приём
   - Видеокомнаты
   - Трансляции
   - Панель администратора

---

## 12. Обновление проекта (каждый раз)

### На локальном ПК (Windows PowerShell):

```powershell
# 1. Собрать фронтенд
cd client
npm run build
cd ..

# 2. Закоммитить и запушить
git add -A
git commit -m "Обновление сайта"
git push
```

### На сервере (SSH):

```bash
# 1. Получить обновления
cd /var/www/koosmo
git pull

# 2. Установить зависимости (если изменились)
cd server && npm ci && cd ..

# 3. Поправить права на uploads
sudo chown -R www-data:www-data /var/www/koosmo/server/uploads

# 4. Перезапустить сервер
sudo systemctl restart koosmo
```

> **Если обновились данные в БД** (новые товары, пользователи):
> ```powershell
> # С локальной машины:
> scp server/database.db root@IP_ВАШЕГО_VPS:/var/www/koosmo/server/
> ```
> Затем на сервере: `sudo systemctl restart koosmo`

---

## 13. Если Nginx не нужен (упрощённый вариант)

Если хотите запустить без Nginx, измените порт в systemd:

```ini
Environment=PORT=80
```

И откройте порт 80 в фаерволе:

```bash
sudo ufw allow 80/tcp
```

Тогда Express будет слушать порт 80 и раздавать всё сам.

---

## 14. Логи

Просмотр логов сервиса:

```bash
sudo journalctl -u koosmo -f
```

Логи Nginx:

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```
