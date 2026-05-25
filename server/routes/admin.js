const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const requireAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

const adminRouter = express.Router();

// GET all users (admin only)
adminRouter.get('/users', requireAdmin, async (req, res) => {
    const db = getDb();
    const users = await db.all('SELECT id, login, isAdmin, isPsychologist, isBowlsSpecialist, fullName, phone, email, createdAt FROM users ORDER BY id');
    res.json(users);
});

// PUT change user role
adminRouter.put('/users/:id/role', requireAdmin, async (req, res) => {
    const db = getDb();
    const { role } = req.body; // 'user', 'admin', 'psychologist', 'bowls'
    const userId = parseInt(req.params.id);
    if (userId === req.user.id) return res.status(400).json({ message: 'Нельзя менять свою роль' });
    let isAdmin = 0, isPsychologist = 0, isBowlsSpecialist = 0;
    if (role === 'admin') isAdmin = 1;
    if (role === 'psychologist') isPsychologist = 1;
    if (role === 'bowls') isBowlsSpecialist = 1;
    await db.run('UPDATE users SET isAdmin = ?, isPsychologist = ?, isBowlsSpecialist = ? WHERE id = ?', isAdmin, isPsychologist, isBowlsSpecialist, userId);
    const user = await db.get('SELECT id, login, isAdmin, isPsychologist, isBowlsSpecialist, fullName, phone, email, createdAt FROM users WHERE id = ?', userId);
    res.json(user);
});

// GET dashboard stats
adminRouter.get('/stats', requireAdmin, async (req, res) => {
    const db = getDb();
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    const productsCount = await db.get('SELECT COUNT(*) as count FROM products');
    const streamsCount = await db.get('SELECT COUNT(*) as count FROM streams');
    const labsCount = await db.get('SELECT COUNT(*) as count FROM labs');
    const plannedStreams = await db.get("SELECT COUNT(*) as count FROM streams WHERE status = 'planned'");
    res.json({
        users: usersCount.count,
        products: productsCount.count,
        streams: streamsCount.count,
        labs: labsCount.count,
        plannedStreams: plannedStreams.count,
    });
});

module.exports = adminRouter;
