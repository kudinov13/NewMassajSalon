const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const md5 = require('md5');

let db;

const initDb = async () => {
    // open the database
    if (!db) {
        db = await open({
            filename: 'database.db', // имя и путь к БД
            driver: sqlite3.Database
        })
    }

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT NOT NULL,
            password TEXT NOT NULL,
            isAdmin INTEGER NOT NULL DEFAULT 0
        )`);

    // миграция для существующей таблицы users
    try {
        await db.exec(`ALTER TABLE users ADD COLUMN isAdmin INTEGER NOT NULL DEFAULT 0`);
    } catch (e) {
        // колонка уже существует - игнорируем
    }

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            token TEXT NOT NULL
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            oldPrice REAL,
            category TEXT NOT NULL DEFAULT 'all',
            image TEXT,
            createdAt TEXT DEFAULT (datetime('now'))
        )`);

    // миграция: добавляем description если нет
    try {
        await db.exec(`ALTER TABLE products ADD COLUMN description TEXT`);
    } catch (e) { /* уже есть */ }

    await db.exec(`
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            productId INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            UNIQUE(userId, productId)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS labs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            organization TEXT NOT NULL,
            url TEXT NOT NULL
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS streams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            speaker TEXT DEFAULT '',
            status TEXT DEFAULT 'planned'
        )`);

    // миграция streams
    try { await db.exec(`ALTER TABLE streams ADD COLUMN speaker TEXT DEFAULT ''`); } catch(e) {}
    try { await db.exec(`ALTER TABLE streams ADD COLUMN status TEXT DEFAULT 'planned'`); } catch(e) {}
    try { await db.exec(`ALTER TABLE streams ADD COLUMN price REAL DEFAULT 0`); } catch(e) {}
    try { await db.exec(`ALTER TABLE streams ADD COLUMN isLive INTEGER DEFAULT 0`); } catch(e) {}
    try { await db.exec(`ALTER TABLE streams ADD COLUMN streamRoomId TEXT DEFAULT ''`); } catch(e) {}

    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_streams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            streamId INTEGER NOT NULL,
            purchasedAt TEXT DEFAULT (datetime('now')),
            UNIQUE(userId, streamId),
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(streamId) REFERENCES streams(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS stream_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            streamId INTEGER NOT NULL,
            userId INTEGER NOT NULL,
            userLogin TEXT NOT NULL,
            message TEXT NOT NULL,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(streamId) REFERENCES streams(id),
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS stream_signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            streamRoomId TEXT NOT NULL,
            senderId INTEGER NOT NULL,
            receiverId INTEGER DEFAULT 0,
            type TEXT NOT NULL,
            data TEXT NOT NULL,
            createdAt TEXT DEFAULT (datetime('now'))
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS stream_viewers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            streamId INTEGER NOT NULL,
            userId INTEGER NOT NULL,
            UNIQUE(streamId, userId)
        )`);


    // миграция users
    try { await db.exec(`ALTER TABLE users ADD COLUMN createdAt TEXT DEFAULT (datetime('now'))`); } catch(e) {}
    try { await db.exec(`ALTER TABLE users ADD COLUMN isPsychologist INTEGER NOT NULL DEFAULT 0`); } catch(e) {}
    try { await db.exec(`ALTER TABLE users ADD COLUMN isBowlsSpecialist INTEGER NOT NULL DEFAULT 0`); } catch(e) {}
    try { await db.exec(`ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''`); } catch(e) {}
    try { await db.exec(`ALTER TABLE users ADD COLUMN fullName TEXT DEFAULT ''`); } catch(e) {}

    await db.exec(`
        CREATE TABLE IF NOT EXISTS schedule_slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            psychologistId INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            isBooked INTEGER DEFAULT 0,
            FOREIGN KEY(psychologistId) REFERENCES users(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            psychologistId INTEGER NOT NULL,
            slotId INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'booked',
            roomId TEXT,
            psychologistJoined INTEGER DEFAULT 0,
            userFullName TEXT DEFAULT '',
            userPhone TEXT DEFAULT '',
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(psychologistId) REFERENCES users(id),
            FOREIGN KEY(slotId) REFERENCES schedule_slots(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS bowls_schedule_slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            specialistId INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            isBooked INTEGER DEFAULT 0,
            FOREIGN KEY(specialistId) REFERENCES users(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS bowls_appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            specialistId INTEGER NOT NULL,
            slotId INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'booked',
            userFullName TEXT DEFAULT '',
            userPhone TEXT DEFAULT '',
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(specialistId) REFERENCES users(id),
            FOREIGN KEY(slotId) REFERENCES bowls_schedule_slots(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS room_signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roomId TEXT NOT NULL,
            senderId INTEGER NOT NULL,
            type TEXT NOT NULL,
            data TEXT NOT NULL,
            createdAt TEXT DEFAULT (datetime('now'))
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL DEFAULT 0,
            image TEXT,
            createdAt TEXT DEFAULT (datetime('now'))
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS course_videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            courseId INTEGER NOT NULL,
            title TEXT NOT NULL,
            videoUrl TEXT NOT NULL,
            sortOrder INTEGER DEFAULT 0,
            FOREIGN KEY(courseId) REFERENCES courses(id) ON DELETE CASCADE
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            courseId INTEGER NOT NULL,
            purchasedAt TEXT DEFAULT (datetime('now')),
            UNIQUE(userId, courseId),
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(courseId) REFERENCES courses(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            total REAL NOT NULL,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER NOT NULL,
            productId INTEGER NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY(orderId) REFERENCES orders(id),
            FOREIGN KEY(productId) REFERENCES products(id)
        )`);

    // тестовая трансляция
    const streamExists = await db.get(`SELECT id FROM streams LIMIT 1`);
    if (!streamExists) {
        await db.run(
            `INSERT INTO streams (title, description, date, time, speaker, status) VALUES (?, ?, ?, ?, ?, ?)`,
            'Утренняя медитация и дыхательные практики',
            'Присоединяйтесь к утренней медитации для гармонизации тела и разума.',
            '2026-06-10', '09:00', 'Мастер Иванова', 'planned'
        );
    }

    // дефолтный адрес
    await db.run(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
        'address', 'г. Новосибирск, ул. Хмельницкого, 1'
    );

    // тестовый админ admin / admin123
    const adminExists = await db.get(`SELECT id FROM users WHERE login = ?`, 'admin');
    if (!adminExists) {
        await db.run(
            `INSERT INTO users (login, password, isAdmin) VALUES (?, ?, ?)`,
            'admin', md5('admin123'), 1
        );
    } else {
        await db.run(`UPDATE users SET isAdmin = 1 WHERE login = ?`, 'admin');
    }

    // психолог psyholog / psyhopog123
    const psychExists = await db.get(`SELECT id FROM users WHERE login = ?`, 'psyholog');
    if (!psychExists) {
        await db.run(
            `INSERT INTO users (login, password, isAdmin, isPsychologist, fullName) VALUES (?, ?, ?, ?, ?)`,
            'psyholog', md5('psyhopog123'), 0, 1, 'Коюшева Оксана Викторовна'
        );
    } else {
        await db.run(`UPDATE users SET isPsychologist = 1, fullName = ? WHERE login = ?`, 'Коюшева Оксана Викторовна', 'psyholog');
    }

    // специалист по тибетским чашам bowls / bowls123
    const bowlsExists = await db.get(`SELECT id FROM users WHERE login = ?`, 'bowls');
    if (!bowlsExists) {
        await db.run(
            `INSERT INTO users (login, password, isAdmin, isBowlsSpecialist, fullName) VALUES (?, ?, ?, ?, ?)`,
            'bowls', md5('bowls123'), 0, 1, 'Специалист по тибетским чашам'
        );
    } else {
        await db.run(`UPDATE users SET isBowlsSpecialist = 1, fullName = ? WHERE login = ?`, 'Специалист по тибетским чашам', 'bowls');
    }

    // тестовый пользователь user / user123
    const userExists = await db.get(`SELECT id FROM users WHERE login = ?`, 'user');
    if (!userExists) {
        await db.run(
            `INSERT INTO users (login, password, isAdmin) VALUES (?, ?, ?)`,
            'user', md5('user123'), 0
        );
    }
};

const getDb = () => db;

module.exports = {
    initDb,
    getDb
}