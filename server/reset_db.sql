-- Скрипт для очистки БД и создания единственного админа
-- Запуск: sqlite3 database.db < reset_db.sql

-- Удалить всех пользователей
DELETE FROM users;

-- Создать админа
-- Логин: tano77@mail.ru
-- Пароль: cjkysirjj (md5 хеш: 4b33e4be7140c4b6700ec8fde847a9fd)
INSERT INTO users (login, password, isAdmin, fullName, phone, email)
VALUES ('tano77@mail.ru', '4b33e4be7140c4b6700ec8fde847a9fd', 1, 'Администратор', '', 'tano77@mail.ru');

-- Очистить остальные таблицы (опционально)
DELETE FROM tokens;
DELETE FROM cart;
DELETE FROM appointments;
DELETE FROM bowls_appointments;
DELETE FROM schedule_slots;
DELETE FROM bowls_schedule_slots;
DELETE FROM user_streams;
DELETE FROM stream_messages;
DELETE FROM stream_signals;
DELETE FROM stream_viewers;
DELETE FROM user_activity_log;
