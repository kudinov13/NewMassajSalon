const { getDb } = require("./db");

const TABLE_NAME = "contact_messages";

module.exports = {
    TABLE_NAME,
    addMessage: async (userId, name, phone, email, message) => {
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} (userId, name, phone, email, message) VALUES (?, ?, ?, ?, ?)`,
            userId || null, name, phone || '', email || '', message
        );
        return result.lastID;
    },
    getAllMessages: async () => {
        return await getDb().all(
            `SELECT * FROM ${TABLE_NAME} ORDER BY createdAt DESC`
        );
    },
    getMessageById: async (id) => {
        return await getDb().get(
            `SELECT * FROM ${TABLE_NAME} WHERE id = ?`, id
        );
    },
    updateStatus: async (id, status, adminReply) => {
        await getDb().run(
            `UPDATE ${TABLE_NAME} SET status = ?, adminReply = ?, repliedAt = datetime('now') WHERE id = ?`,
            status, adminReply || null, id
        );
    }
};
