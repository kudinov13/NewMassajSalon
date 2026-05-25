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
    // превью-видео у трансляции
    try { await db.exec(`ALTER TABLE streams ADD COLUMN previewUrl TEXT`); } catch(e) {}

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
    try { await db.exec(`ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''`); } catch(e) {}

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

    await db.exec(`
        CREATE TABLE IF NOT EXISTS diagnostics_schedule_slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            specialistId INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            isBooked INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY(specialistId) REFERENCES users(id)
        )`);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS diagnostics_appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slotId INTEGER NOT NULL,
            userId INTEGER NOT NULL,
            fullName TEXT NOT NULL,
            phone TEXT NOT NULL,
            roomId TEXT NOT NULL,
            roomActive INTEGER NOT NULL DEFAULT 0,
            adminInRoom INTEGER NOT NULL DEFAULT 0,
            adminLastSeen TEXT,
            roomClosedAt TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(slotId) REFERENCES diagnostics_schedule_slots(id),
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

    // миграция: products.courseId
    try { await db.exec(`ALTER TABLE products ADD COLUMN courseId INTEGER DEFAULT NULL`); } catch(e) {}
    // миграция: products.partnerUrl (ссылка на товар у партнёра)
    try { await db.exec(`ALTER TABLE products ADD COLUMN partnerUrl TEXT`); } catch(e) {}

    // миграция: diagnostics_appointments room state fields
    try { await db.exec(`ALTER TABLE diagnostics_appointments ADD COLUMN roomActive INTEGER DEFAULT 0`); } catch(e) {}
    try { await db.exec(`ALTER TABLE diagnostics_appointments ADD COLUMN adminInRoom INTEGER DEFAULT 0`); } catch(e) {}
    try { await db.exec(`ALTER TABLE diagnostics_appointments ADD COLUMN adminLastSeen TEXT`); } catch(e) {}
    try { await db.exec(`ALTER TABLE diagnostics_appointments ADD COLUMN roomClosedAt TEXT`); } catch(e) {}

    // город для расписания тибетских чаш
    try { await db.exec(`ALTER TABLE bowls_schedule_slots ADD COLUMN city TEXT DEFAULT 'novosibirsk'`); } catch(e) {}
    try { await db.exec(`ALTER TABLE bowls_appointments ADD COLUMN city TEXT DEFAULT ''`); } catch(e) {}
    try { await db.exec(`ALTER TABLE bowls_appointments ADD COLUMN userEmail TEXT DEFAULT ''`); } catch(e) {}

    // журнал активности пользователей
    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            userLogin TEXT DEFAULT '',
            userFullName TEXT DEFAULT '',
            action TEXT NOT NULL,
            details TEXT DEFAULT '',
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

    // Инструкция / навигация по сайту
    await db.exec(`
        CREATE TABLE IF NOT EXISTS guide_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            sortOrder INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT (datetime('now'))
        )`);

    // Медиа тибетских чаш (видео + аудио)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS bowls_media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL DEFAULT 'audio',
            title TEXT NOT NULL DEFAULT '',
            url TEXT NOT NULL,
            createdAt TEXT DEFAULT (datetime('now'))
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

    // начальные пункты инструкции
    const guideExists = await db.get(`SELECT id FROM guide_items LIMIT 1`);
    if (!guideExists) {
        const items = [
            { t: 'Регистрация и вход', b: 'Нажмите кнопку «Вход» в правом верхнем углу. Если у вас ещё нет аккаунта, нажмите «Регистрация», заполните логин, пароль, имя и телефон. После регистрации войдите с помощью логина и пароля.', o: 1 },
            { t: 'Магазин — как купить продукт', b: 'Перейдите в раздел «Магазин» через меню или главную страницу. Выберите категорию, найдите нужный товар и нажмите «В корзину». Затем перейдите в корзину (иконка в шапке сайта) и оформите заказ. Товары из категории «БАДы» приобретаются на сайте партнёра — нажмите «Купить у партнёра».', o: 2 },
            { t: 'Курсы — просмотр купленных курсов', b: 'После покупки курса в магазине, перейдите в личный кабинет (иконка профиля). Нажмите «Мои курсы» — здесь отображаются все приобретённые видеокурсы. Нажмите на курс, чтобы начать просмотр видеоуроков.', o: 3 },
            { t: 'Запись на приём к психологу', b: 'Перейдите в раздел «Психология» → «Записаться на приём». Выберите свободную дату и время из расписания, заполните имя и телефон, подтвердите запись. Когда подойдёт время, в личном кабинете появится кнопка для входа в видеоконференцию.', o: 4 },
            { t: 'Видеоконференция — как зайти', b: 'Когда специалист начнёт приём, в вашем личном кабинете рядом с записью появится кнопка «Войти в комнату». Нажмите её — откроется страница видеозвонка. Разрешите доступ к камере и микрофону в браузере.', o: 5 },
            { t: 'Тибетские чаши — запись на массаж в 4 руки', b: 'Перейдите в раздел «Тибетские чаши» через меню. Нажмите «Записаться на сеанс». Перед выбором даты выберите город — Бийск или Новосибирск. Каждый город имеет своё расписание. Это уникальный массаж тибетскими чашами в 4 руки — два мастера одновременно работают с вашим телом. Также на странице можно послушать записи звучания чаш — нажмите кнопку «Послушать записи».', o: 6 },
            { t: 'Диагностика', b: 'В разделе «Диагностика» выберите тип диагностики (ногти, язык, глаза, кожа, тело). Запишитесь на удобное время. Диагностика проходит по видеосвязи — когда подойдёт время, зайдите в личный кабинет и нажмите «Войти в комнату».', o: 7 },
            { t: 'Трансляции — прямые эфиры', b: 'В разделе «Трансляции» отображаются предстоящие прямые эфиры. У каждой трансляции указана дата, время и цена. Бесплатные — нажмите «Записаться», платные — «Купить». Если у трансляции есть видеообзор, нажмите кнопку «Обзор» чтобы посмотреть превью. Когда эфир начнётся, нажмите «Смотреть».', o: 8 },
            { t: 'Анализы', b: 'В разделе «Анализы» вы можете ознакомиться с доступными обследованиями, их описанием и стоимостью. Следуйте инструкциям на странице для записи.', o: 9 },
            { t: 'Личный кабинет', b: 'В личном кабинете (иконка профиля в шапке) вы найдёте: ваши записи на приём, купленные курсы, историю заказов, предстоящие трансляции. Здесь же вы можете войти в видеоконференцию, когда придёт время.', o: 10 },
        ];
        for (const it of items) {
            await db.run('INSERT INTO guide_items (title, body, sortOrder) VALUES (?, ?, ?)', it.t, it.b, it.o);
        }
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