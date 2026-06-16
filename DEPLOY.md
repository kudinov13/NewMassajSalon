# Инструкция по деплою на VPS (FirstVDS) с доменом koosmo.ru

## 1. Подготовка локального проекта

### 1.1 Собрать фронтенд

```bash
cd client
npm ci
npm run build
```

После сборки в папке `client/build` появятся файлы для продакшена.

### 1.2 Подготовить БД

База данных SQLite находится в `server/database.db`. Скопируйте её, если хотите перенести существующие данные.

---

## 2. Настройка VPS (Ubuntu 24.04)

### 2.1 Подключение к серверу

```bash
ssh root@IP_ВАШЕГО_VPS
```

### 2.2 Обновить систему и установить ПО

```bash
sudo apt update
sudo apt upgrade -y
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

## 3. Загрузка проекта на сервер

### Вариант A: Через Git (если есть репозиторий)

```bash
cd /var/www/koosmo
git clone <ВАШ_РЕПОЗИТОРИЙ> .
```

### Вариант B: Через SCP (если нет Git)

На локальной машине:

```bash
# Загрузить всё кроме node_modules и build
scp -r --exclude=node_modules --exclude=build c:/Проекты\ WEB/Сайт\ маме/* root@IP:/var/www/koosmo/
```

### Вариант C: Через SFTP (FileZilla, WinSCP)

Подключитесь к серверу по SFTP и загрузите файлы в `/var/www/koosmo`.

---

## 4. Установка зависимостей на сервере

### 4.1 Серверная часть

```bash
cd /var/www/koosmo/server
npm ci
mkdir -p uploads
```

### 4.2 Копирование БД (если есть данные)

```bash
# Скопируйте database.db с локальной машины
# Например через SCP:
scp server/database.db root@IP:/var/www/koosmo/server/
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

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API и uploads пробрасываем на Node
    location ~ ^/(auth|user|settings|products|cart|labs|streams|admin|schedule|appointments|room|stream-room|bowls|bowls-schedule|diagnostics-schedule|courses|guide|bowls-media|activity|uploads) {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
# На локальной машине
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
   - Регистрация/авторизация
   - Магазин, корзина
   - Запись на приём
   - Видеокомнаты
   - Трансляции
   - Панель администратора

---

## 12. Обновление проекта

При каждом обновлении:

```bash
# На сервере
cd /var/www/koosmo
git pull  # или загрузите новые файлы

# Собрать фронтенд (если изменился)
cd client
npm ci
npm run build

# Перезапустить сервисы
sudo systemctl restart nginx
cd ../server
npm ci
sudo systemctl restart koosmo
```

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
