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

const requireAdmin = async (req, res, next) => {
    await requireAuth(req, res, () => {
        if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
        next();
    });
};

const streamRoomRouter = express.Router();

// POST start stream (admin)
streamRoomRouter.post('/:id/start', requireAdmin, async (req, res) => {
    const db = getDb();
    const stream = await db.get('SELECT * FROM streams WHERE id = ?', req.params.id);
    if (!stream) return res.status(404).json({ message: 'Трансляция не найдена' });
    const roomId = crypto.randomUUID();
    await db.run("UPDATE streams SET isLive = 1, status = 'live', streamRoomId = ? WHERE id = ?", roomId, req.params.id);
    // Clear old signals
    await db.run('DELETE FROM stream_signals WHERE streamRoomId = ?', roomId);
    await db.run('DELETE FROM stream_viewers WHERE streamId = ?', req.params.id);
    res.json({ roomId, streamId: stream.id });
});

// POST stop stream (admin)
streamRoomRouter.post('/:id/stop', requireAdmin, async (req, res) => {
    const db = getDb();
    const stream = await db.get('SELECT * FROM streams WHERE id = ?', req.params.id);
    if (!stream) return res.status(404).json({ message: 'Трансляция не найдена' });
    await db.run("UPDATE streams SET isLive = 0, status = 'completed', stoppedAt = datetime('now') WHERE id = ?", req.params.id);
    await db.run('DELETE FROM stream_signals WHERE streamRoomId = ?', stream.streamRoomId);
    res.json({ ok: true });
});

// GET stream history (admin) — all completed streams with participants
streamRoomRouter.get('/history', requireAdmin, async (req, res) => {
    const db = getDb();
    const streams = await db.all("SELECT * FROM streams WHERE status = 'completed' ORDER BY stoppedAt DESC, date DESC");
    const result = [];
    for (const s of streams) {
        const purchasers = await db.all(
            `SELECT u.id, u.login, u.fullName, u.email, u.phone, us.purchasedAt
             FROM user_streams us JOIN users u ON u.id = us.userId
             WHERE us.streamId = ? ORDER BY us.purchasedAt`, s.id
        );
        const viewers = await db.all(
            `SELECT u.id, u.login, u.fullName, u.email, u.phone
             FROM stream_viewers sv JOIN users u ON u.id = sv.userId
             WHERE sv.streamId = ?`, s.id
        );
        result.push({ ...s, purchasers, viewers });
    }
    res.json(result);
});

// POST restore stream (admin) — make completed stream available again for its purchasers
streamRoomRouter.post('/:id/restore', requireAdmin, async (req, res) => {
    const db = getDb();
    const stream = await db.get('SELECT * FROM streams WHERE id = ?', req.params.id);
    if (!stream) return res.status(404).json({ message: 'Трансляция не найдена' });
    await db.run("UPDATE streams SET status = 'planned', stoppedAt = NULL WHERE id = ?", req.params.id);
    res.json({ ok: true });
});

// POST user joins/purchases stream
streamRoomRouter.post('/:id/join', requireAuth, async (req, res) => {
    const db = getDb();
    const stream = await db.get('SELECT * FROM streams WHERE id = ?', req.params.id);
    if (!stream) return res.status(404).json({ message: 'Трансляция не найдена' });
    // For now, allow join (payment will be added later)
    try {
        await db.run('INSERT OR IGNORE INTO user_streams (userId, streamId) VALUES (?, ?)', req.user.id, req.params.id);
    } catch (e) {}
    res.json({ ok: true });
});

// GET user's streams
streamRoomRouter.get('/my', requireAuth, async (req, res) => {
    const db = getDb();
    const streams = await db.all(
        `SELECT s.* FROM streams s
         INNER JOIN user_streams us ON us.streamId = s.id
         WHERE us.userId = ? ORDER BY s.date, s.time`,
        req.user.id
    );
    res.json(streams);
});

// GET stream room info (for viewer)
streamRoomRouter.get('/:id/room', requireAuth, async (req, res) => {
    const db = getDb();
    const stream = await db.get('SELECT * FROM streams WHERE id = ?', req.params.id);
    if (!stream) return res.status(404).json({ message: 'Трансляция не найдена' });

    // Check user has access
    const access = await db.get('SELECT * FROM user_streams WHERE userId = ? AND streamId = ?', req.user.id, req.params.id);
    if (!access && !req.user.isAdmin && stream.price > 0) {
        return res.status(403).json({ message: 'У вас нет доступа к этой трансляции' });
    }

    // Check timing: allow 2 min before or if live
    if (!stream.isLive && !req.user.isAdmin) {
        const now = new Date();
        const [h, m] = stream.time.split(':').map(Number);
        const streamTime = new Date(stream.date + 'T00:00:00');
        streamTime.setHours(h, m, 0, 0);
        const diffMin = (streamTime - now) / 60000;
        if (diffMin > 2) {
            return res.status(403).json({ message: 'Трансляция ещё не началась' });
        }
    }

    // Register viewer
    try {
        await db.run('INSERT OR IGNORE INTO stream_viewers (streamId, userId) VALUES (?, ?)', stream.id, req.user.id);
    } catch (e) {}

    res.json(stream);
});

// GET viewers list (admin)
streamRoomRouter.get('/:id/viewers', requireAdmin, async (req, res) => {
    const db = getDb();
    const viewers = await db.all(
        'SELECT sv.userId FROM stream_viewers sv WHERE sv.streamId = ?', req.params.id
    );
    res.json(viewers);
});

// POST send signal (broadcaster sends to specific viewer, or viewer sends to broadcaster)
streamRoomRouter.post('/:id/signal', requireAuth, async (req, res) => {
    const db = getDb();
    const stream = await db.get('SELECT * FROM streams WHERE id = ?', req.params.id);
    if (!stream) return res.status(404).json({ message: 'Не найдена' });
    const { type, data, receiverId } = req.body;
    await db.run(
        'INSERT INTO stream_signals (streamRoomId, senderId, receiverId, type, data) VALUES (?, ?, ?, ?, ?)',
        stream.streamRoomId, req.user.id, receiverId || 0, type, JSON.stringify(data)
    );
    res.json({ ok: true });
});

// GET signals for me
streamRoomRouter.get('/:id/signals', requireAuth, async (req, res) => {
    const db = getDb();
    const stream = await db.get('SELECT * FROM streams WHERE id = ?', req.params.id);
    if (!stream) return res.status(404).json({ message: 'Не найдена' });
    const afterId = parseInt(req.query.after) || 0;
    // Get signals addressed to me (receiverId = my id) or broadcast (receiverId = 0 for admin signals to all new viewers)
    const signals = await db.all(
        'SELECT * FROM stream_signals WHERE streamRoomId = ? AND (receiverId = ? OR (receiverId = 0 AND senderId != ?)) AND id > ? ORDER BY id',
        stream.streamRoomId, req.user.id, req.user.id, afterId
    );
    res.json(signals.map(s => ({ ...s, data: JSON.parse(s.data) })));
});

// POST chat message
streamRoomRouter.post('/:id/chat', requireAuth, async (req, res) => {
    const db = getDb();
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Пустое сообщение' });
    const result = await db.run(
        'INSERT INTO stream_messages (streamId, userId, userLogin, message) VALUES (?, ?, ?, ?)',
        req.params.id, req.user.id, req.user.login, message.trim()
    );
    res.json({ id: result.lastID, userLogin: req.user.login, message: message.trim(), createdAt: new Date().toISOString() });
});

// GET chat messages
streamRoomRouter.get('/:id/chat', requireAuth, async (req, res) => {
    const db = getDb();
    const afterId = parseInt(req.query.after) || 0;
    const messages = await db.all(
        'SELECT * FROM stream_messages WHERE streamId = ? AND id > ? ORDER BY id',
        req.params.id, afterId
    );
    res.json(messages);
});

module.exports = streamRoomRouter;
