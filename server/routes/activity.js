const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const activityRouter = express.Router();

const requireStaff = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || (!user.isAdmin && !user.isPsychologist && !user.isBowlsSpecialist))
        return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

// Log activity (called from frontend)
activityRouter.post('/', async (req, res) => {
    const { action, details } = req.body;
    if (!action) return res.status(400).json({ message: 'action required' });
    const db = getDb();
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    let login = '', fullName = '';
    if (userId) {
        const u = await getUserById(userId);
        if (u) { login = u.login || ''; fullName = u.fullName || ''; }
    }
    await db.run(
        'INSERT INTO user_activity_log (userId, userLogin, userFullName, action, details) VALUES (?, ?, ?, ?, ?)',
        userId || null, login, fullName, action, details || ''
    );
    res.json({ ok: true });
});

// Get activity log (staff only)
activityRouter.get('/', requireStaff, async (req, res) => {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    if (search) {
        const q = `%${search}%`;
        const rows = await db.all(
            'SELECT * FROM user_activity_log WHERE userLogin LIKE ? OR userFullName LIKE ? OR action LIKE ? OR details LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
            q, q, q, q, limit, offset
        );
        return res.json(rows);
    }
    const rows = await db.all(
        'SELECT * FROM user_activity_log ORDER BY id DESC LIMIT ? OFFSET ?',
        limit, offset
    );
    res.json(rows);
});

// Get users list with contact info (staff only)
activityRouter.get('/users', requireStaff, async (req, res) => {
    const db = getDb();
    const search = req.query.search || '';
    if (search) {
        const q = `%${search}%`;
        const users = await db.all(
            'SELECT id, login, fullName, phone, email, isAdmin, isPsychologist, isBowlsSpecialist, createdAt FROM users WHERE login LIKE ? OR fullName LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY id DESC',
            q, q, q, q
        );
        return res.json(users);
    }
    const users = await db.all(
        'SELECT id, login, fullName, phone, email, isAdmin, isPsychologist, isBowlsSpecialist, createdAt FROM users ORDER BY id DESC'
    );
    res.json(users);
});

module.exports = activityRouter;
