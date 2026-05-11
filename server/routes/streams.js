const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getAllStreams, addStream, updateStream, deleteStream } = require('../db/streams');

const requireAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

const streamsRouter = express.Router();

streamsRouter.get('/', async (req, res) => {
    const streams = await getAllStreams();
    res.json(streams);
});

streamsRouter.post('/', requireAdmin, async (req, res) => {
    const { title, description, date, time, speaker, status, price } = req.body;
    if (!title || !date || !time) {
        return res.status(400).json({ message: 'Заполните обязательные поля' });
    }
    const stream = await addStream({ title, description: description || '', date, time, speaker: speaker || '', status: status || 'planned', price: price || 0 });
    res.json(stream);
});

streamsRouter.put('/:id', requireAdmin, async (req, res) => {
    const { title, description, date, time, speaker, status, price } = req.body;
    if (!title || !date || !time) {
        return res.status(400).json({ message: 'Заполните обязательные поля' });
    }
    const stream = await updateStream(parseInt(req.params.id), { title, description: description || '', date, time, speaker: speaker || '', status: status || 'planned', price: price || 0 });
    res.json(stream);
});

streamsRouter.delete('/:id', requireAdmin, async (req, res) => {
    await deleteStream(parseInt(req.params.id));
    res.json({ ok: true });
});

module.exports = streamsRouter;
