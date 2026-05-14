const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getAllProducts, getProductsByCategory, addProduct, updateProduct, deleteProduct, getProductById } = require('../db/products');
const { getDb } = require('../db/db');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

const convertToPng = async (fileBuffer) => {
    const filename = Date.now() + '-' + Math.round(Math.random() * 1e6) + '.png';
    const filepath = path.join(uploadsDir, filename);
    await sharp(fileBuffer).png().toFile(filepath);
    return '/uploads/' + filename;
};

const requireAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    req.user = await getUserById(userId);
    next();
};

const productsRouter = express.Router();

// Helper: ensure course exists for a product
const ensureCourseForProduct = async (productId, name) => {
    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', productId);
    if (product && product.courseId) return product.courseId;
    const r = await db.run('INSERT INTO courses (title, description, price, image) VALUES (?, ?, ?, ?)', name, '', 0, null);
    await db.run('UPDATE products SET courseId = ? WHERE id = ?', r.lastID, productId);
    return r.lastID;
};

// GET all products, optionally filter by ?category=
productsRouter.get('/', async (req, res) => {
    const { category } = req.query;
    const products = category && category !== 'all'
        ? await getProductsByCategory(category)
        : await getAllProducts();
    res.json(products);
});

// POST create product (admin only)
productsRouter.post('/', requireAdmin, upload.single('image'), async (req, res) => {
    const { name, description, price, oldPrice, category } = req.body;
    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }
    const image = req.file ? await convertToPng(req.file.buffer) : null;
    const product = await addProduct({
        name,
        description: description || null,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        category,
        image
    });
    // Auto-create course for self-massage category
    if (category === 'self-massage') {
        await ensureCourseForProduct(product.id, name);
    }
    const updated = await getProductById(product.id);
    res.json(updated);
});

// PUT update product (admin only)
productsRouter.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
    const { name, description, price, oldPrice, category } = req.body;
    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }
    const image = req.file
        ? await convertToPng(req.file.buffer)
        : req.body.existingImage || null;
    const product = await updateProduct(parseInt(req.params.id), {
        name,
        description: description || null,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        category,
        image
    });
    // Auto-create course for self-massage category
    if (category === 'self-massage') {
        await ensureCourseForProduct(product.id, name);
    }
    const updated = await getProductById(product.id);
    res.json(updated);
});

// DELETE product (admin only)
productsRouter.delete('/:id', requireAdmin, async (req, res) => {
    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (product && product.courseId) {
        await db.run('DELETE FROM course_videos WHERE courseId = ?', product.courseId);
        await db.run('DELETE FROM user_courses WHERE courseId = ?', product.courseId);
        await db.run('DELETE FROM courses WHERE id = ?', product.courseId);
    }
    await deleteProduct(parseInt(req.params.id));
    res.json({ ok: true });
});

// GET videos for a product (admin)
productsRouter.get('/:id/videos', requireAdmin, async (req, res) => {
    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!product || !product.courseId) return res.json([]);
    const videos = await db.all('SELECT * FROM course_videos WHERE courseId = ? ORDER BY sortOrder', product.courseId);
    res.json(videos);
});

// POST upload video to product (admin)
productsRouter.post('/:id/videos', requireAdmin, upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });
    const { title } = req.body;
    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    let courseId = product.courseId;
    if (!courseId) {
        courseId = await ensureCourseForProduct(product.id, product.name);
    }
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.mp4';
    const filename = `video-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
    const videoUrl = `/uploads/${filename}`;
    const maxOrder = await db.get('SELECT MAX(sortOrder) as m FROM course_videos WHERE courseId = ?', courseId);
    const sortOrder = (maxOrder?.m || 0) + 1;
    const r = await db.run('INSERT INTO course_videos (courseId, title, videoUrl, sortOrder) VALUES (?, ?, ?, ?)', courseId, title || `Урок ${sortOrder}`, videoUrl, sortOrder);
    res.json({ id: r.lastID, courseId, title: title || `Урок ${sortOrder}`, videoUrl, sortOrder });
});

// DELETE video from product (admin)
productsRouter.delete('/:id/videos/:videoId', requireAdmin, async (req, res) => {
    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!product || !product.courseId) return res.status(404).json({ message: 'Не найдено' });
    await db.run('DELETE FROM course_videos WHERE id = ? AND courseId = ?', req.params.videoId, product.courseId);
    res.json({ ok: true });
});

// PUT reorder videos (admin)
productsRouter.put('/:id/videos/reorder', requireAdmin, async (req, res) => {
    const { videoIds } = req.body;
    if (!Array.isArray(videoIds)) return res.status(400).json({ message: 'videoIds required' });
    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!product || !product.courseId) return res.status(404).json({ message: 'Не найдено' });
    for (let i = 0; i < videoIds.length; i++) {
        await db.run('UPDATE course_videos SET sortOrder = ? WHERE id = ? AND courseId = ?', i + 1, videoIds[i], product.courseId);
    }
    const videos = await db.all('SELECT * FROM course_videos WHERE courseId = ? ORDER BY sortOrder', product.courseId);
    res.json(videos);
});

// PUT update video title (admin)
productsRouter.put('/:id/videos/:videoId', requireAdmin, async (req, res) => {
    const { title } = req.body;
    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!product || !product.courseId) return res.status(404).json({ message: 'Не найдено' });
    await db.run('UPDATE course_videos SET title = ? WHERE id = ? AND courseId = ?', title, req.params.videoId, product.courseId);
    const video = await db.get('SELECT * FROM course_videos WHERE id = ?', req.params.videoId);
    res.json(video);
});

module.exports = productsRouter;
