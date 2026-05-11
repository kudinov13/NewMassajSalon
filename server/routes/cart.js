const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } = require('../db/cart');
const { getDb } = require('../db/db');

const cartRouter = express.Router();

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    req.userId = userId;
    next();
};

// GET cart
cartRouter.get('/', requireAuth, async (req, res) => {
    const items = await getCart(req.userId);
    res.json(items);
});

// POST add to cart
cartRouter.post('/', requireAuth, async (req, res) => {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId обязателен' });
    await addToCart(req.userId, productId);
    const items = await getCart(req.userId);
    res.json(items);
});

// PUT update quantity
cartRouter.put('/:productId', requireAuth, async (req, res) => {
    const { quantity } = req.body;
    await updateCartQuantity(req.userId, parseInt(req.params.productId), quantity);
    const items = await getCart(req.userId);
    res.json(items);
});

// DELETE remove item
cartRouter.delete('/:productId', requireAuth, async (req, res) => {
    await removeFromCart(req.userId, parseInt(req.params.productId));
    const items = await getCart(req.userId);
    res.json(items);
});

// DELETE clear cart
cartRouter.delete('/', requireAuth, async (req, res) => {
    await clearCart(req.userId);
    res.json([]);
});

// POST checkout - create order from cart
cartRouter.post('/checkout', requireAuth, async (req, res) => {
    const items = await getCart(req.userId);
    if (!items.length) return res.status(400).json({ message: 'Корзина пуста' });
    const db = getDb();
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const r = await db.run('INSERT INTO orders (userId, total) VALUES (?, ?)', req.userId, total);
    const orderId = r.lastID;
    for (const item of items) {
        await db.run(
            'INSERT INTO order_items (orderId, productId, name, price, quantity) VALUES (?, ?, ?, ?, ?)',
            orderId, item.productId, item.name, item.price, item.quantity
        );
    }
    await clearCart(req.userId);
    res.json({ orderId, total });
});

// GET orders history
cartRouter.get('/orders', requireAuth, async (req, res) => {
    const db = getDb();
    const orders = await db.all('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', req.userId);
    for (const order of orders) {
        order.items = await db.all('SELECT * FROM order_items WHERE orderId = ?', order.id);
    }
    res.json(orders);
});

module.exports = cartRouter;
