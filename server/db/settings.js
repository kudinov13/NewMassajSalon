const {getDb} = require("./db");

const TABLE_NAME = "settings";

module.exports = {
    getSetting: async (key) => {
        const row = await getDb().get(`SELECT value FROM ${TABLE_NAME} WHERE key = ?`, key);
        return row ? row.value : null;
    },
    setSetting: async (key, value) => {
        await getDb().run(
            `INSERT INTO ${TABLE_NAME} (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            key, value
        );
    },
    getAllSettings: async () => {
        const rows = await getDb().all(`SELECT key, value FROM ${TABLE_NAME}`);
        return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
    }
};
