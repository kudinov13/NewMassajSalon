const { getDb } = require('./db');

const getAllStreams = async () => {
    const db = getDb();
    return db.all('SELECT * FROM streams ORDER BY date DESC');
};

const addStream = async ({ title, description, date, time, speaker, status, price }) => {
    const db = getDb();
    const result = await db.run(
        'INSERT INTO streams (title, description, date, time, speaker, status, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
        title, description, date, time, speaker || '', status || 'planned', price || 0
    );
    return { id: result.lastID, title, description, date, time, speaker, status, price: price || 0 };
};

const updateStream = async (id, { title, description, date, time, speaker, status, price }) => {
    const db = getDb();
    await db.run(
        'UPDATE streams SET title = ?, description = ?, date = ?, time = ?, speaker = ?, status = ?, price = ? WHERE id = ?',
        title, description, date, time, speaker || '', status || 'planned', price || 0, id
    );
    return { id, title, description, date, time, speaker, status, price: price || 0 };
};

const deleteStream = async (id) => {
    const db = getDb();
    await db.run('DELETE FROM streams WHERE id = ?', id);
};

module.exports = { getAllStreams, addStream, updateStream, deleteStream };
