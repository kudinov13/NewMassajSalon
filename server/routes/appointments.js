const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');
const crypto = require('crypto');

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    req.user = await getUserById(userId);
    next();
};

const appointmentsRouter = express.Router();

// GET my appointments (user or psychologist)
appointmentsRouter.get('/my', requireAuth, async (req, res) => {
    const db = getDb();
    let rows;
    if (req.user.isPsychologist) {
        rows = await db.all(
            `SELECT a.*, u.login as userLogin FROM appointments a
             LEFT JOIN users u ON a.userId = u.id
             WHERE a.psychologistId = ? ORDER BY a.date, a.time`,
            req.user.id
        );
    } else {
        rows = await db.all(
            'SELECT * FROM appointments WHERE userId = ? ORDER BY date, time',
            req.user.id
        );
    }
    res.json(rows);
});

// GET single appointment
appointmentsRouter.get('/:id', requireAuth, async (req, res) => {
    const db = getDb();
    const a = await db.get('SELECT * FROM appointments WHERE id = ?', req.params.id);
    if (!a) return res.status(404).json({ message: 'Запись не найдена' });
    if (a.userId !== req.user.id && a.psychologistId !== req.user.id) {
        return res.status(403).json({ message: 'Доступ запрещён' });
    }
    res.json(a);
});

// POST book appointment
appointmentsRouter.post('/', requireAuth, async (req, res) => {
    const { slotId, fullName, phone } = req.body;
    if (!slotId || !fullName || !phone) {
        return res.status(400).json({ message: 'Заполните ФИО и телефон' });
    }

    const db = getDb();
    const slot = await db.get('SELECT * FROM schedule_slots WHERE id = ? AND isBooked = 0', slotId);
    if (!slot) return res.status(400).json({ message: 'Слот уже занят или не существует' });

    // Check 2-hour rule for today
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (slot.date === today) {
        const [h, m] = slot.time.split(':').map(Number);
        const slotMinutes = h * 60 + m;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        if (slotMinutes - nowMinutes < 120) {
            return res.status(400).json({ message: 'Нельзя записаться менее чем за 2 часа до приёма' });
        }
    }

    const roomId = crypto.randomUUID();
    await db.run('UPDATE schedule_slots SET isBooked = 1 WHERE id = ?', slotId);
    const result = await db.run(
        `INSERT INTO appointments (userId, psychologistId, slotId, date, time, roomId, userFullName, userPhone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        req.user.id, slot.psychologistId, slotId, slot.date, slot.time, roomId, fullName, phone
    );

    // Update user profile too
    await db.run('UPDATE users SET fullName = ?, phone = ? WHERE id = ?', fullName, phone, req.user.id);

    res.json({ id: result.lastID, date: slot.date, time: slot.time, roomId, status: 'booked' });
});

// POST psychologist starts session
appointmentsRouter.post('/:id/start', requireAuth, async (req, res) => {
    const db = getDb();
    const a = await db.get('SELECT * FROM appointments WHERE id = ?', req.params.id);
    if (!a) return res.status(404).json({ message: 'Не найдено' });
    if (a.psychologistId !== req.user.id) return res.status(403).json({ message: 'Доступ запрещён' });
    await db.run("UPDATE appointments SET status = 'in_progress', psychologistJoined = 1 WHERE id = ?", req.params.id);
    // Clean old signals for this room
    await db.run('DELETE FROM room_signals WHERE roomId = ?', a.roomId);
    res.json({ ok: true, roomId: a.roomId });
});

// POST complete session
appointmentsRouter.post('/:id/complete', requireAuth, async (req, res) => {
    const db = getDb();
    const a = await db.get('SELECT * FROM appointments WHERE id = ?', req.params.id);
    if (!a) return res.status(404).json({ message: 'Не найдено' });
    if (a.psychologistId !== req.user.id) return res.status(403).json({ message: 'Доступ запрещён' });
    await db.run("UPDATE appointments SET status = 'completed' WHERE id = ?", req.params.id);
    await db.run('DELETE FROM room_signals WHERE roomId = ?', a.roomId);
    res.json({ ok: true });
});

// Cancel appointment
appointmentsRouter.delete('/:id', requireAuth, async (req, res) => {
    const db = getDb();
    const a = await db.get('SELECT * FROM appointments WHERE id = ?', req.params.id);
    if (!a) return res.status(404).json({ message: 'Не найдено' });
    if (a.userId !== req.user.id && a.psychologistId !== req.user.id) {
        return res.status(403).json({ message: 'Доступ запрещён' });
    }
    await db.run('UPDATE schedule_slots SET isBooked = 0 WHERE id = ?', a.slotId);
    await db.run("UPDATE appointments SET status = 'cancelled' WHERE id = ?", req.params.id);
    res.json({ ok: true });
});

module.exports = appointmentsRouter;
