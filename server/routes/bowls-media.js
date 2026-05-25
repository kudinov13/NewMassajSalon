const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const bowlsMediaRouter = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

const canEdit = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || (!user.isAdmin && !user.isBowlsSpecialist)) return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

bowlsMediaRouter.get('/', async (req, res) => {
    const items = await getDb().all('SELECT * FROM bowls_media ORDER BY id DESC');
    res.json(items);
});

bowlsMediaRouter.post('/', canEdit, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });
    const title = req.body.title || '';
    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const isVideo = ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext);
    const type = isVideo ? 'video' : 'audio';
    const filename = `bowls-media-${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, req.file.buffer);
    const url = `/uploads/${filename}`;
    const result = await getDb().run('INSERT INTO bowls_media (type, title, url) VALUES (?, ?, ?)', type, title, url);
    const item = await getDb().get('SELECT * FROM bowls_media WHERE id = ?', result.lastID);
    res.json(item);
});

bowlsMediaRouter.delete('/:id', canEdit, async (req, res) => {
    const item = await getDb().get('SELECT * FROM bowls_media WHERE id = ?', req.params.id);
    if (item && item.url) {
        const filePath = path.join(uploadsDir, path.basename(item.url));
        try { fs.unlinkSync(filePath); } catch(e) {}
    }
    await getDb().run('DELETE FROM bowls_media WHERE id = ?', req.params.id);
    res.json({ ok: true });
});

module.exports = bowlsMediaRouter;
