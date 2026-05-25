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

const roomRouter = express.Router();

// GET room info
roomRouter.get('/:roomId', requireAuth, async (req, res) => {
    const db = getDb();
    const roomId = req.params.roomId;

    // Check if it's a diagnostics room (starts with 'diag-')
    if (roomId.startsWith('diag-')) {
        const a = await db.get('SELECT da.*, dss.date, dss.time FROM diagnostics_appointments da JOIN diagnostics_schedule_slots dss ON da.slotId = dss.id WHERE da.roomId = ?', roomId);
        if (!a) return res.status(404).json({ message: 'Комната не найдена' });

        // Check if user has access (admin or the client)
        const slot = await db.get('SELECT * FROM diagnostics_schedule_slots WHERE id = ?', a.slotId);
        if (!req.user.isAdmin && a.userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        // Check if room is active
        if (a.roomActive === 0 && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Комната ещё не активирована админом' });
        }

        res.json({ ...a, date: a.date, time: a.time });
    } else {
        // Psychology room
        const a = await db.get('SELECT * FROM appointments WHERE roomId = ?', roomId);
        if (!a) return res.status(404).json({ message: 'Комната не найдена' });
        if (a.userId !== req.user.id && a.psychologistId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        // Check if user can join (2 min before or psychologist started)
        const isPsych = a.psychologistId === req.user.id;
        if (!isPsych) {
            const now = new Date();
            const [h, m] = a.time.split(':').map(Number);
            const apptTime = new Date(a.date + 'T00:00:00');
            apptTime.setHours(h, m, 0, 0);
            const diffMs = apptTime - now;
            const diffMin = diffMs / 60000;
            if (diffMin > 2 && !a.psychologistJoined) {
                return res.status(403).json({ message: 'Приём ещё не начался. Вход возможен за 2 минуты до начала или когда психолог начнёт приём.' });
            }
        }

        res.json(a);
    }
});

// POST signal (WebRTC signaling via polling)
roomRouter.post('/:roomId/signal', requireAuth, async (req, res) => {
    const db = getDb();
    const roomId = req.params.roomId;

    // Check if it's a diagnostics room
    if (roomId.startsWith('diag-')) {
        const a = await db.get('SELECT * FROM diagnostics_appointments WHERE roomId = ?', roomId);
        if (!a) return res.status(404).json({ message: 'Комната не найдена' });
        if (!req.user.isAdmin && a.userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
    } else {
        const a = await db.get('SELECT * FROM appointments WHERE roomId = ?', roomId);
        if (!a) return res.status(404).json({ message: 'Комната не найдена' });
        if (a.userId !== req.user.id && a.psychologistId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
    }

    const { type, data } = req.body;
    await db.run(
        'INSERT INTO room_signals (roomId, senderId, type, data) VALUES (?, ?, ?, ?)',
        roomId, req.user.id, type, JSON.stringify(data)
    );
    res.json({ ok: true });
});

// GET signals (poll for new signals from other peer)
roomRouter.get('/:roomId/signals', requireAuth, async (req, res) => {
    const db = getDb();
    const roomId = req.params.roomId;

    // Check if it's a diagnostics room
    if (roomId.startsWith('diag-')) {
        const a = await db.get('SELECT * FROM diagnostics_appointments WHERE roomId = ?', roomId);
        if (!a) return res.status(404).json({ message: 'Комната не найдена' });
        if (!req.user.isAdmin && a.userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
    } else {
        const a = await db.get('SELECT * FROM appointments WHERE roomId = ?', roomId);
        if (!a) return res.status(404).json({ message: 'Комната не найдена' });
        if (a.userId !== req.user.id && a.psychologistId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
    }

    const afterId = parseInt(req.query.after) || 0;
    const signals = await db.all(
        'SELECT * FROM room_signals WHERE roomId = ? AND senderId != ? AND id > ? ORDER BY id',
        roomId, req.user.id, afterId
    );
    res.json(signals.map(s => ({ ...s, data: JSON.parse(s.data) })));
});

module.exports = roomRouter;
