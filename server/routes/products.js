const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getAllProducts, getProductsByCategory, addProduct, updateProduct, deleteProduct } = require('../db/products');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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

const productsRouter = express.Router();

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
    res.json(product);
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
    res.json(product);
});

// DELETE product (admin only)
productsRouter.delete('/:id', requireAdmin, async (req, res) => {
    await deleteProduct(parseInt(req.params.id));
    res.json({ ok: true });
});

module.exports = productsRouter;
