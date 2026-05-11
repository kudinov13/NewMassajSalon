const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getAllLabs, addLab, updateLab, deleteLab } = require('../db/labs');

const requireAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

const labsRouter = express.Router();

// GET all labs
labsRouter.get('/', async (req, res) => {
    const labs = await getAllLabs();
    res.json(labs);
});

// POST create lab (admin only)
labsRouter.post('/', requireAdmin, async (req, res) => {
    const { name, organization, url } = req.body;
    if (!name || !organization || !url) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }
    const lab = await addLab({ name, organization, url });
    res.json(lab);
});

// PUT update lab (admin only)
labsRouter.put('/:id', requireAdmin, async (req, res) => {
    const { name, organization, url } = req.body;
    if (!name || !organization || !url) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }
    const lab = await updateLab(parseInt(req.params.id), { name, organization, url });
    res.json(lab);
});

// DELETE lab (admin only)
labsRouter.delete('/:id', requireAdmin, async (req, res) => {
    await deleteLab(parseInt(req.params.id));
    res.json({ ok: true });
});

module.exports = labsRouter;
