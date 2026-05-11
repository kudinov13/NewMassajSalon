const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    req.user = await getUserById(userId);
    next();
};

const requirePsychologist = async (req, res, next) => {
    await requireAuth(req, res, () => {
        if (!req.user || !req.user.isPsychologist) return res.status(403).json({ message: 'Доступ запрещён' });
        next();
    });
};

const scheduleRouter = express.Router();

// GET available slots (for users)
scheduleRouter.get('/', async (req, res) => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const slots = await db.all(
        'SELECT * FROM schedule_slots WHERE date >= ? AND isBooked = 0 ORDER BY date, time',
        today
    );
    res.json(slots);
});

// GET all slots (for psychologist)
scheduleRouter.get('/all', requirePsychologist, async (req, res) => {
    const db = getDb();
    const slots = await db.all(
        'SELECT * FROM schedule_slots WHERE psychologistId = ? ORDER BY date, time',
        req.user.id
    );
    res.json(slots);
});

// POST create slot(s)
scheduleRouter.post('/', requirePsychologist, async (req, res) => {
    const { date, times } = req.body; // times is array of time strings
    if (!date || !times || !times.length) {
        return res.status(400).json({ message: 'Укажите дату и время' });
    }

    // Validate: can only set for current month, or next month if last week of current
    const now = new Date();
    const slotDate = new Date(date + 'T00:00:00');
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const slotYear = slotDate.getFullYear();
    const slotMonth = slotDate.getMonth();

    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isLastWeek = now.getDate() > lastDayOfMonth - 7;

    const isCurrentMonth = slotYear === currentYear && slotMonth === currentMonth;
    const isNextMonth = (slotYear === currentYear && slotMonth === currentMonth + 1) ||
                        (currentMonth === 11 && slotYear === currentYear + 1 && slotMonth === 0);

    if (!isCurrentMonth && !(isNextMonth && isLastWeek)) {
        return res.status(400).json({ message: 'Можно устанавливать расписание только на текущий месяц, или на следующий — в последнюю неделю текущего' });
    }

    const db = getDb();
    const created = [];
    for (const time of times) {
        const exists = await db.get(
            'SELECT id FROM schedule_slots WHERE psychologistId = ? AND date = ? AND time = ?',
            req.user.id, date, time
        );
        if (!exists) {
            const r = await db.run(
                'INSERT INTO schedule_slots (psychologistId, date, time) VALUES (?, ?, ?)',
                req.user.id, date, time
            );
            created.push({ id: r.lastID, date, time, isBooked: 0 });
        }
    }
    res.json(created);
});

// DELETE slot
scheduleRouter.delete('/:id', requirePsychologist, async (req, res) => {
    const db = getDb();
    const slot = await db.get('SELECT * FROM schedule_slots WHERE id = ? AND psychologistId = ?', req.params.id, req.user.id);
    if (!slot) return res.status(404).json({ message: 'Слот не найден' });
    if (slot.isBooked) return res.status(400).json({ message: 'Нельзя удалить забронированный слот' });
    await db.run('DELETE FROM schedule_slots WHERE id = ?', req.params.id);
    res.json({ ok: true });
});

module.exports = scheduleRouter;
