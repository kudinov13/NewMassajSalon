const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } = require('../db/cart');
const { getDb } = require('../db/db');
const { createOrderFromCart } = require('../db/orders');
const { orderPaymentUrl } = require('../utils/orderPaymentUrl');

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
    const db = getDb();
    const product = await db.get('SELECT category, partnerUrl FROM products WHERE id = ?', productId);
    if (product && product.category === 'bady') {
        return res.status(400).json({ message: 'Этот товар приобретается на сайте партнёра', partnerUrl: product.partnerUrl || '' });
    }
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

// POST checkout - create pending order from cart and return Robokassa payment URL
cartRouter.post('/checkout', requireAuth, async (req, res) => {
    try {
        const order = await createOrderFromCart(req.userId);
        if (!order) return res.status(400).json({ message: 'Корзина пуста' });
        const paymentUrl = await orderPaymentUrl({ id: order.orderId, total: order.total, userId: req.userId });
        res.json({ orderId: order.orderId, total: order.total, paymentUrl });
    } catch (e) {
        console.error('checkout error:', e);
        res.status(500).json({ message: 'Не удалось оформить заказ' });
    }
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
