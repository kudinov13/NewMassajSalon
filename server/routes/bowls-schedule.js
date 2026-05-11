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

const requireBowls = async (req, res, next) => {
    await requireAuth(req, res, () => {
        if (!req.user || !req.user.isBowlsSpecialist) return res.status(403).json({ message: 'Доступ запрещён' });
        next();
    });
};

const bowlsScheduleRouter = express.Router();

// GET available slots (for users)
bowlsScheduleRouter.get('/', async (req, res) => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const slots = await db.all(
        'SELECT * FROM bowls_schedule_slots WHERE date >= ? AND isBooked = 0 ORDER BY date, time',
        today
    );
    res.json(slots);
});

// GET all slots (for specialist)
bowlsScheduleRouter.get('/all', requireBowls, async (req, res) => {
    const db = getDb();
    const slots = await db.all(
        'SELECT * FROM bowls_schedule_slots WHERE specialistId = ? ORDER BY date, time',
        req.user.id
    );
    res.json(slots);
});

// POST create slot(s)
bowlsScheduleRouter.post('/', requireBowls, async (req, res) => {
    const { date, times } = req.body;
    if (!date || !times || !times.length) {
        return res.status(400).json({ message: 'Укажите дату и время' });
    }
    const db = getDb();
    const created = [];
    for (const time of times) {
        const exists = await db.get(
            'SELECT id FROM bowls_schedule_slots WHERE specialistId = ? AND date = ? AND time = ?',
            req.user.id, date, time
        );
        if (!exists) {
            const r = await db.run(
                'INSERT INTO bowls_schedule_slots (specialistId, date, time) VALUES (?, ?, ?)',
                req.user.id, date, time
            );
            created.push({ id: r.lastID, date, time, isBooked: 0 });
        }
    }
    res.json(created);
});

// DELETE slot
bowlsScheduleRouter.delete('/:id', requireBowls, async (req, res) => {
    const db = getDb();
    const slot = await db.get('SELECT * FROM bowls_schedule_slots WHERE id = ? AND specialistId = ?', req.params.id, req.user.id);
    if (!slot) return res.status(404).json({ message: 'Слот не найден' });
    if (slot.isBooked) return res.status(400).json({ message: 'Нельзя удалить забронированный слот' });
    await db.run('DELETE FROM bowls_schedule_slots WHERE id = ?', req.params.id);
    res.json({ ok: true });
});

// POST book appointment
bowlsScheduleRouter.post('/book', requireAuth, async (req, res) => {
    const { slotId, fullName, phone } = req.body;
    if (!slotId) return res.status(400).json({ message: 'Укажите слот' });
    const db = getDb();
    const slot = await db.get('SELECT * FROM bowls_schedule_slots WHERE id = ? AND isBooked = 0', slotId);
    if (!slot) return res.status(400).json({ message: 'Слот недоступен' });
    await db.run('UPDATE bowls_schedule_slots SET isBooked = 1 WHERE id = ?', slotId);
    const r = await db.run(
        'INSERT INTO bowls_appointments (userId, specialistId, slotId, date, time, userFullName, userPhone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        req.user.id, slot.specialistId, slotId, slot.date, slot.time, fullName || '', phone || ''
    );
    res.json({ id: r.lastID, date: slot.date, time: slot.time, status: 'booked' });
});

// GET my appointments (specialist)
bowlsScheduleRouter.get('/appointments', requireBowls, async (req, res) => {
    const db = getDb();
    const appts = await db.all(
        'SELECT * FROM bowls_appointments WHERE specialistId = ? ORDER BY date, time',
        req.user.id
    );
    res.json(appts);
});

// GET user's appointments
bowlsScheduleRouter.get('/my-appointments', requireAuth, async (req, res) => {
    const db = getDb();
    const appts = await db.all(
        'SELECT * FROM bowls_appointments WHERE userId = ? ORDER BY date DESC, time DESC',
        req.user.id
    );
    res.json(appts);
});

module.exports = bowlsScheduleRouter;
