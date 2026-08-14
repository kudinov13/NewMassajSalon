const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const beforeAfterRouter = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const isAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

beforeAfterRouter.get('/', async (req, res) => {
    try {
        const items = await getDb().all('SELECT * FROM before_after ORDER BY sortOrder ASC, id DESC');
        res.json(items);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при получении результатов' });
    }
});

beforeAfterRouter.get('/:id', async (req, res) => {
    try {
        const item = await getDb().get('SELECT * FROM before_after WHERE id = ?', req.params.id);
        if (!item) return res.status(404).json({ message: 'Не найдено' });
        res.json(item);
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

beforeAfterRouter.post('/', isAdmin, upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!req.files?.beforeImage?.[0] || !req.files?.afterImage?.[0]) {
            return res.status(400).json({ message: 'Загрузите оба изображения (до и после)' });
        }

        const beforeExt = path.extname(req.files.beforeImage[0].originalname || '.webp').toLowerCase();
        const afterExt = path.extname(req.files.afterImage[0].originalname || '.webp').toLowerCase();
        const beforeFilename = `before-${Date.now()}${beforeExt}`;
        const afterFilename = `after-${Date.now()}${afterExt}`;

        fs.writeFileSync(path.join(uploadsDir, beforeFilename), req.files.beforeImage[0].buffer);
        fs.writeFileSync(path.join(uploadsDir, afterFilename), req.files.afterImage[0].buffer);

        const beforeUrl = `/uploads/${beforeFilename}`;
        const afterUrl = `/uploads/${afterFilename}`;

        const result = await getDb().run(
            'INSERT INTO before_after (title, description, beforeImage, afterImage) VALUES (?, ?, ?, ?)',
            title || '', description || '', beforeUrl, afterUrl
        );
        const item = await getDb().get('SELECT * FROM before_after WHERE id = ?', result.lastID);
        res.status(201).json(item);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при создании' });
    }
});

beforeAfterRouter.put('/:id', isAdmin, upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, description } = req.body;
        const existing = await getDb().get('SELECT * FROM before_after WHERE id = ?', req.params.id);
        if (!existing) return res.status(404).json({ message: 'Не найдено' });

        let beforeUrl = existing.beforeImage;
        let afterUrl = existing.afterImage;

        if (req.files?.beforeImage?.[0]) {
            const ext = path.extname(req.files.beforeImage[0].originalname || '.webp').toLowerCase();
            const filename = `before-${Date.now()}${ext}`;
            fs.writeFileSync(path.join(uploadsDir, filename), req.files.beforeImage[0].buffer);
            beforeUrl = `/uploads/${filename}`;
            try { fs.unlinkSync(path.join(uploadsDir, path.basename(existing.beforeImage))); } catch {}
        }

        if (req.files?.afterImage?.[0]) {
            const ext = path.extname(req.files.afterImage[0].originalname || '.webp').toLowerCase();
            const filename = `after-${Date.now()}${ext}`;
            fs.writeFileSync(path.join(uploadsDir, filename), req.files.afterImage[0].buffer);
            afterUrl = `/uploads/${filename}`;
            try { fs.unlinkSync(path.join(uploadsDir, path.basename(existing.afterImage))); } catch {}
        }

        await getDb().run(
            'UPDATE before_after SET title = ?, description = ?, beforeImage = ?, afterImage = ? WHERE id = ?',
            title || '', description || '', beforeUrl, afterUrl, req.params.id
        );
        const item = await getDb().get('SELECT * FROM before_after WHERE id = ?', req.params.id);
        res.json(item);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при обновлении' });
    }
});

beforeAfterRouter.delete('/:id', isAdmin, async (req, res) => {
    try {
        const item = await getDb().get('SELECT * FROM before_after WHERE id = ?', req.params.id);
        if (!item) return res.status(404).json({ message: 'Не найдено' });
        try { fs.unlinkSync(path.join(uploadsDir, path.basename(item.beforeImage))); } catch {}
        try { fs.unlinkSync(path.join(uploadsDir, path.basename(item.afterImage))); } catch {}
        await getDb().run('DELETE FROM before_after WHERE id = ?', req.params.id);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при удалении' });
    }
});

module.exports = beforeAfterRouter;
