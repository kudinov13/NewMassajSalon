const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const guideRouter = express.Router();

const requireAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

guideRouter.get('/', async (req, res) => {
    const items = await getDb().all('SELECT * FROM guide_items ORDER BY sortOrder ASC, id ASC');
    res.json(items);
});

guideRouter.post('/', requireAdmin, async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Заполните название и текст' });
    const maxOrder = await getDb().get('SELECT MAX(sortOrder) as mx FROM guide_items');
    const sortOrder = (maxOrder?.mx || 0) + 1;
    const result = await getDb().run('INSERT INTO guide_items (title, body, sortOrder) VALUES (?, ?, ?)', title, body, sortOrder);
    const item = await getDb().get('SELECT * FROM guide_items WHERE id = ?', result.lastID);
    res.json(item);
});

guideRouter.put('/:id', requireAdmin, async (req, res) => {
    const { title, body, sortOrder } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Заполните название и текст' });
    if (sortOrder !== undefined) {
        await getDb().run('UPDATE guide_items SET title = ?, body = ?, sortOrder = ? WHERE id = ?', title, body, sortOrder, req.params.id);
    } else {
        await getDb().run('UPDATE guide_items SET title = ?, body = ? WHERE id = ?', title, body, req.params.id);
    }
    const item = await getDb().get('SELECT * FROM guide_items WHERE id = ?', req.params.id);
    res.json(item);
});

guideRouter.delete('/:id', requireAdmin, async (req, res) => {
    await getDb().run('DELETE FROM guide_items WHERE id = ?', req.params.id);
    res.json({ ok: true });
});

module.exports = guideRouter;
