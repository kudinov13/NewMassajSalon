const { getDb } = require('../db/db');
const { getUserById } = require('../db/users');
const { buildPaymentUrl } = require('./robokassa');

// позиции заказа с привязкой к курсам (для чека и платёжной ссылки)
const orderItemsWithProducts = async (orderId) => {
    const db = getDb();
    return db.all(
        `SELECT oi.name, oi.price, oi.quantity, p.courseId
         FROM order_items oi LEFT JOIN products p ON p.id = oi.productId
         WHERE oi.orderId = ?`,
        orderId
    );
};

const orderPaymentUrl = async (order) => {
    const items = await orderItemsWithProducts(order.id);
    const user = await getUserById(order.userId);
    return buildPaymentUrl({
        orderId: order.id,
        total: order.total,
        items,
        email: user?.email || undefined,
    });
};

module.exports = { orderPaymentUrl };
