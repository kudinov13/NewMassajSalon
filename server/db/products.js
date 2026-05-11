const { getDb } = require('./db');

const getAllProducts = async () => {
    const db = getDb();
    return await db.all('SELECT * FROM products ORDER BY createdAt DESC');
};

const getProductsByCategory = async (category) => {
    const db = getDb();
    return await db.all('SELECT * FROM products WHERE category = ? ORDER BY createdAt DESC', category);
};

const getProductById = async (id) => {
    const db = getDb();
    return await db.get('SELECT * FROM products WHERE id = ?', id);
};

const addProduct = async ({ name, description, price, oldPrice, category, image }) => {
    const db = getDb();
    const result = await db.run(
        'INSERT INTO products (name, description, price, oldPrice, category, image) VALUES (?, ?, ?, ?, ?, ?)',
        name, description || null, price, oldPrice || null, category, image || null
    );
    return await getProductById(result.lastID);
};

const updateProduct = async (id, { name, description, price, oldPrice, category, image }) => {
    const db = getDb();
    await db.run(
        'UPDATE products SET name = ?, description = ?, price = ?, oldPrice = ?, category = ?, image = ? WHERE id = ?',
        name, description || null, price, oldPrice || null, category, image || null, id
    );
    return await getProductById(id);
};

const deleteProduct = async (id) => {
    const db = getDb();
    await db.run('DELETE FROM products WHERE id = ?', id);
};

module.exports = {
    getAllProducts,
    getProductsByCategory,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};
