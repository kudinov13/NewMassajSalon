const { getDb } = require('./db');

const getCart = async (userId) => {
    const db = getDb();
    return await db.all(
        `SELECT c.id, c.productId, c.quantity, p.name, p.description, p.price, p.oldPrice, p.category, p.image
         FROM cart c JOIN products p ON c.productId = p.id
         WHERE c.userId = ?`,
        userId
    );
};

const addToCart = async (userId, productId) => {
    const db = getDb();
    await db.run(
        `INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, 1)
         ON CONFLICT(userId, productId) DO UPDATE SET quantity = quantity + 1`,
        userId, productId
    );
};

const updateCartQuantity = async (userId, productId, quantity) => {
    const db = getDb();
    if (quantity <= 0) {
        await db.run('DELETE FROM cart WHERE userId = ? AND productId = ?', userId, productId);
    } else {
        await db.run('UPDATE cart SET quantity = ? WHERE userId = ? AND productId = ?', quantity, userId, productId);
    }
};

const removeFromCart = async (userId, productId) => {
    const db = getDb();
    await db.run('DELETE FROM cart WHERE userId = ? AND productId = ?', userId, productId);
};

const clearCart = async (userId) => {
    const db = getDb();
    await db.run('DELETE FROM cart WHERE userId = ?', userId);
};

module.exports = { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart };
