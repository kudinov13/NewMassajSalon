const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const coursesRouter = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

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

// GET all courses (public)
coursesRouter.get('/', async (req, res) => {
    const db = getDb();
    const courses = await db.all('SELECT * FROM courses ORDER BY id DESC');
    res.json(courses);
});

// GET single course with videos (requires purchase or admin)
coursesRouter.get('/:id', requireAuth, async (req, res) => {
    const db = getDb();
    const course = await db.get('SELECT * FROM courses WHERE id = ?', req.params.id);
    if (!course) return res.status(404).json({ message: 'Курс не найден' });
    const owned = req.user.isAdmin || await db.get('SELECT id FROM user_courses WHERE userId = ? AND courseId = ?', req.user.id, course.id);
    if (!owned) return res.status(403).json({ message: 'Курс не приобретён' });
    course.videos = await db.all('SELECT * FROM course_videos WHERE courseId = ? ORDER BY sortOrder', course.id);
    res.json(course);
});

// POST create course (admin)
coursesRouter.post('/', requireAdmin, upload.single('image'), async (req, res) => {
    const { title, description, price } = req.body;
    if (!title) return res.status(400).json({ message: 'Укажите название' });
    let image = null;
    if (req.file) {
        const filename = `course-${Date.now()}${path.extname(req.file.originalname) || '.png'}`;
        fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
        image = `/uploads/${filename}`;
    }
    const db = getDb();
    const r = await db.run('INSERT INTO courses (title, description, price, image) VALUES (?, ?, ?, ?)', title, description || '', parseFloat(price) || 0, image);
    const course = await db.get('SELECT * FROM courses WHERE id = ?', r.lastID);
    res.json(course);
});

// PUT update course (admin)
coursesRouter.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
    const { title, description, price } = req.body;
    const db = getDb();
    const course = await db.get('SELECT * FROM courses WHERE id = ?', req.params.id);
    if (!course) return res.status(404).json({ message: 'Курс не найден' });
    let image = course.image;
    if (req.file) {
        const filename = `course-${Date.now()}${path.extname(req.file.originalname) || '.png'}`;
        fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
        image = `/uploads/${filename}`;
    }
    await db.run('UPDATE courses SET title = ?, description = ?, price = ?, image = ? WHERE id = ?', title || course.title, description ?? course.description, parseFloat(price) || course.price, image, req.params.id);
    const updated = await db.get('SELECT * FROM courses WHERE id = ?', req.params.id);
    res.json(updated);
});

// DELETE course (admin)
coursesRouter.delete('/:id', requireAdmin, async (req, res) => {
    const db = getDb();
    await db.run('DELETE FROM course_videos WHERE courseId = ?', req.params.id);
    await db.run('DELETE FROM user_courses WHERE courseId = ?', req.params.id);
    await db.run('DELETE FROM courses WHERE id = ?', req.params.id);
    res.json({ ok: true });
});

// POST upload video to course (admin)
coursesRouter.post('/:id/videos', requireAdmin, upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });
    const { title } = req.body;
    const db = getDb();
    const course = await db.get('SELECT * FROM courses WHERE id = ?', req.params.id);
    if (!course) return res.status(404).json({ message: 'Курс не найден' });
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.mp4';
    const filename = `video-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
    const videoUrl = `/uploads/${filename}`;
    const maxOrder = await db.get('SELECT MAX(sortOrder) as m FROM course_videos WHERE courseId = ?', course.id);
    const sortOrder = (maxOrder?.m || 0) + 1;
    const r = await db.run('INSERT INTO course_videos (courseId, title, videoUrl, sortOrder) VALUES (?, ?, ?, ?)', course.id, title || `Урок ${sortOrder}`, videoUrl, sortOrder);
    res.json({ id: r.lastID, courseId: course.id, title: title || `Урок ${sortOrder}`, videoUrl, sortOrder });
});

// DELETE video from course (admin)
coursesRouter.delete('/:id/videos/:videoId', requireAdmin, async (req, res) => {
    const db = getDb();
    await db.run('DELETE FROM course_videos WHERE id = ? AND courseId = ?', req.params.videoId, req.params.id);
    res.json({ ok: true });
});

// POST purchase course
coursesRouter.post('/:id/purchase', requireAuth, async (req, res) => {
    const db = getDb();
    const course = await db.get('SELECT * FROM courses WHERE id = ?', req.params.id);
    if (!course) return res.status(404).json({ message: 'Курс не найден' });
    const exists = await db.get('SELECT id FROM user_courses WHERE userId = ? AND courseId = ?', req.user.id, course.id);
    if (exists) return res.json({ ok: true, already: true });
    await db.run('INSERT INTO user_courses (userId, courseId) VALUES (?, ?)', req.user.id, course.id);
    res.json({ ok: true });
});

// GET my courses
coursesRouter.get('/my/list', requireAuth, async (req, res) => {
    const db = getDb();
    const courses = await db.all(
        'SELECT c.* FROM courses c JOIN user_courses uc ON uc.courseId = c.id WHERE uc.userId = ? ORDER BY uc.purchasedAt DESC',
        req.user.id
    );
    res.json(courses);
});

module.exports = coursesRouter;
