const { getDb } = require('./db');
const { getCart, clearCart } = require('./cart');

// Создаёт заказ из корзины пользователя со статусом 'pending' и очищает корзину
const createOrderFromCart = async (userId) => {
    const items = await getCart(userId);
    if (!items.length) return null;
    const db = getDb();
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const r = await db.run(`INSERT INTO orders (userId, total, status) VALUES (?, ?, 'pending')`, userId, total);
    const orderId = r.lastID;
    for (const item of items) {
        await db.run(
            'INSERT INTO order_items (orderId, productId, name, price, quantity) VALUES (?, ?, ?, ?, ?)',
            orderId, item.productId, item.name, item.price, item.quantity
        );
    }
    await clearCart(userId);
    return { orderId, total, items };
};

const getOrder = async (orderId) => {
    const db = getDb();
    const order = await db.get('SELECT * FROM orders WHERE id = ?', orderId);
    if (order) {
        order.items = await db.all('SELECT * FROM order_items WHERE orderId = ?', orderId);
    }
    return order;
};

// Отмечает заказ оплаченным и выдаёт доступы к курсам. Идемпотентно.
const markOrderPaid = async (orderId) => {
    const db = getDb();
    const order = await getOrder(orderId);
    if (!order) return null;
    if (order.status === 'paid') return order;

    await db.run(
        `UPDATE orders SET status = 'paid', paidAt = datetime('now') WHERE id = ?`,
        orderId
    );

    for (const item of order.items) {
        const product = await db.get('SELECT courseId FROM products WHERE id = ?', item.productId);
        if (product && product.courseId) {
            await db.run('INSERT OR IGNORE INTO user_courses (userId, courseId) VALUES (?, ?)', order.userId, product.courseId);
        }
    }

    order.status = 'paid';
    order.justPaid = true;
    return order;
};

module.exports = { createOrderFromCart, getOrder, markOrderPaid };
