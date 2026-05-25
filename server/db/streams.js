const { getDb } = require('./db');

const getAllStreams = async () => {
    const db = getDb();
    return db.all('SELECT * FROM streams ORDER BY date DESC');
};

const addStream = async ({ title, description, date, time, speaker, status, price, previewUrl }) => {
    const db = getDb();
    const result = await db.run(
        'INSERT INTO streams (title, description, date, time, speaker, status, price, previewUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        title, description, date, time, speaker || '', status || 'planned', price || 0, previewUrl || null
    );
    return { id: result.lastID, title, description, date, time, speaker, status, price: price || 0, previewUrl: previewUrl || null };
};

const updateStream = async (id, { title, description, date, time, speaker, status, price, previewUrl }) => {
    const db = getDb();
    await db.run(
        'UPDATE streams SET title = ?, description = ?, date = ?, time = ?, speaker = ?, status = ?, price = ?, previewUrl = ? WHERE id = ?',
        title, description, date, time, speaker || '', status || 'planned', price || 0, previewUrl || null, id
    );
    return { id, title, description, date, time, speaker, status, price: price || 0, previewUrl: previewUrl || null };
};

const deleteStream = async (id) => {
    const db = getDb();
    await db.run('DELETE FROM streams WHERE id = ?', id);
};

module.exports = { getAllStreams, addStream, updateStream, deleteStream };
