const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const { logActivity } = require('../db/activity');

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    req.user = await getUserById(userId);
    next();
};

const requireAdmin = async (req, res, next) => {
    await requireAuth(req, res, () => {
        if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
        next();
    });
};

const diagnosticsScheduleRouter = express.Router();

// GET available slots (for users)
diagnosticsScheduleRouter.get('/', async (req, res) => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const slots = await db.all(
        'SELECT * FROM diagnostics_schedule_slots WHERE date >= ? AND isBooked = 0 ORDER BY date, time',
        today
    );
    res.json(slots);
});

// GET all slots (for admin)
diagnosticsScheduleRouter.get('/all', requireAdmin, async (req, res) => {
    const db = getDb();
    const slots = await db.all(
        'SELECT * FROM diagnostics_schedule_slots WHERE specialistId = ? ORDER BY date, time',
        req.user.id
    );
    res.json(slots);
});

// POST create slot(s)
diagnosticsScheduleRouter.post('/', requireAdmin, async (req, res) => {
    const { date, times } = req.body; // times is array of time strings
    if (!date || !times || !times.length) {
        return res.status(400).json({ message: 'Укажите дату и время' });
    }

    // Validate: can only set for current month, or next month if last week of current
    const now = new Date();
    const slotDate = new Date(date + 'T00:00:00');
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isLastWeek = now.getDate() > lastDay - 7;
    const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);
    const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    const allowedMax = isLastWeek ? nextMonthEnd : thisMonthEnd;
    if (slotDate < new Date(now.toISOString().split('T')[0] + 'T00:00:00') || slotDate > allowedMax) {
        return res.status(400).json({ message: 'Некорректная дата' });
    }

    const db = getDb();

    // Check for existing slots to prevent duplicates
    const existing = await db.all(
        'SELECT time FROM diagnostics_schedule_slots WHERE specialistId = ? AND date = ?',
        req.user.id, date
    );
    const existingTimes = new Set(existing.map(s => s.time));
    const duplicateTimes = times.filter(t => existingTimes.has(t));
    if (duplicateTimes.length > 0) {
        return res.status(400).json({ message: 'Слоты на это время уже созданы', duplicates: duplicateTimes });
    }

    const created = [];
    for (const time of times) {
        const r = await db.run(
            'INSERT INTO diagnostics_schedule_slots (specialistId, date, time) VALUES (?, ?, ?)',
            req.user.id, date, time
        );
        created.push({ id: r.lastID, date, time, isBooked: 0 });
    }
    res.json(created);
});

// DELETE slot
diagnosticsScheduleRouter.delete('/:id', requireAdmin, async (req, res) => {
    const db = getDb();
    const slot = await db.get('SELECT * FROM diagnostics_schedule_slots WHERE id = ? AND specialistId = ?', req.params.id, req.user.id);
    if (!slot) return res.status(404).json({ message: 'Слот не найден' });
    if (slot.isBooked) return res.status(400).json({ message: 'Нельзя удалить забронированный слот' });
    await db.run('DELETE FROM diagnostics_schedule_slots WHERE id = ?', req.params.id);
    res.json({ ok: true });
});

// POST book a slot
diagnosticsScheduleRouter.post('/book', requireAuth, async (req, res) => {
    const { slotId, fullName, phone } = req.body;
    if (!slotId || !fullName || !phone) {
        return res.status(400).json({ message: 'Укажите слот, ФИО и телефон' });
    }

    const db = getDb();
    const slot = await db.get('SELECT * FROM diagnostics_schedule_slots WHERE id = ? AND isBooked = 0', slotId);
    if (!slot) return res.status(404).json({ message: 'Слот не найден или уже забронирован' });

    // Create appointment with video room (inactive until admin joins)
    const roomId = 'diag-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    await db.run(
        'INSERT INTO diagnostics_appointments (slotId, userId, fullName, phone, roomId, roomActive, adminInRoom) VALUES (?, ?, ?, ?, ?, 0, 0)',
        slotId, req.user.id, fullName, phone, roomId
    );

    // Mark slot as booked
    await db.run('UPDATE diagnostics_schedule_slots SET isBooked = 1 WHERE id = ?', slotId);

    logActivity(req.user.id, req.user.login, fullName, 'Запись на диагностику', `${slot.date} ${slot.time}`);
    res.json({ roomId });
});

// POST admin join room (activates room)
diagnosticsScheduleRouter.post('/join-room/:appointmentId', requireAdmin, async (req, res) => {
    const db = getDb();
    const appointment = await db.get('SELECT * FROM diagnostics_appointments WHERE id = ?', req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Запись не найдена' });

    // Activate room and mark admin as present
    await db.run(
        'UPDATE diagnostics_appointments SET roomActive = 1, adminInRoom = 1, adminLastSeen = datetime("now"), roomClosedAt = NULL WHERE id = ?',
        req.params.appointmentId
    );

    res.json({ roomId: appointment.roomId });
});

// POST admin leave room
diagnosticsScheduleRouter.post('/leave-room/:appointmentId', requireAdmin, async (req, res) => {
    const db = getDb();
    const appointment = await db.get('SELECT * FROM diagnostics_appointments WHERE id = ?', req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Запись не найдена' });

    // Mark admin as left but room remains active for 30 min
    await db.run(
        'UPDATE diagnostics_appointments SET adminInRoom = 0, adminLastSeen = datetime("now") WHERE id = ?',
        req.params.appointmentId
    );

    res.json({ ok: true });
});

// GET room status
diagnosticsScheduleRouter.get('/room-status/:appointmentId', requireAuth, async (req, res) => {
    const db = getDb();
    const appointment = await db.get('SELECT * FROM diagnostics_appointments WHERE id = ?', req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Запись не найдена' });

    // Check if room should be closed (30 min without admin, after 10 min grace period)
    if (appointment.adminInRoom === 0 && appointment.adminLastSeen) {
        const lastSeen = new Date(appointment.adminLastSeen);
        const now = new Date();
        const diffMin = (now.getTime() - lastSeen.getTime()) / 60000;
        // Close room after 40 minutes total (10 min grace period + 30 min absence)
        if (diffMin > 40) {
            await db.run(
                'UPDATE diagnostics_appointments SET roomActive = 0, roomClosedAt = datetime("now") WHERE id = ?',
                req.params.appointmentId
            );
            appointment.roomActive = 0;
        }
    }

    res.json({
        roomActive: appointment.roomActive === 1,
        adminInRoom: appointment.adminInRoom === 1,
        roomId: appointment.roomId
    });
});

// GET my appointments
diagnosticsScheduleRouter.get('/my-appointments', requireAuth, async (req, res) => {
    const db = getDb();
    const appointments = await db.all(`
        SELECT da.*, dss.date, dss.time
        FROM diagnostics_appointments da
        JOIN diagnostics_schedule_slots dss ON da.slotId = dss.id
        WHERE da.userId = ?
        ORDER BY dss.date DESC, dss.time DESC
    `, req.user.id);
    res.json(appointments);
});

// GET all appointments (for admin)
diagnosticsScheduleRouter.get('/all-appointments', requireAdmin, async (req, res) => {
    const db = getDb();
    const appointments = await db.all(`
        SELECT da.*, dss.date, dss.time
        FROM diagnostics_appointments da
        JOIN diagnostics_schedule_slots dss ON da.slotId = dss.id
        ORDER BY dss.date DESC, dss.time DESC
    `);
    res.json(appointments);
});

module.exports = diagnosticsScheduleRouter;
