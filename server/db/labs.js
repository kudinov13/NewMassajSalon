const { getDb } = require('./db');

const getAllLabs = async () => {
    const db = getDb();
    return db.all('SELECT * FROM labs ORDER BY id DESC');
};

const addLab = async ({ name, organization, url }) => {
    const db = getDb();
    const result = await db.run(
        'INSERT INTO labs (name, organization, url) VALUES (?, ?, ?)',
        name, organization, url
    );
    return { id: result.lastID, name, organization, url };
};

const updateLab = async (id, { name, organization, url }) => {
    const db = getDb();
    await db.run(
        'UPDATE labs SET name = ?, organization = ?, url = ? WHERE id = ?',
        name, organization, url, id
    );
    return { id, name, organization, url };
};

const deleteLab = async (id) => {
    const db = getDb();
    await db.run('DELETE FROM labs WHERE id = ?', id);
};

module.exports = { getAllLabs, addLab, updateLab, deleteLab };
