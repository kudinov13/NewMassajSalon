const { getDb } = require('./db');

async function logActivity(userId, userLogin, userFullName, action, details) {
    try {
        await getDb().run(
            'INSERT INTO user_activity_log (userId, userLogin, userFullName, action, details) VALUES (?, ?, ?, ?, ?)',
            userId || null, userLogin || '', userFullName || '', action, details || ''
        );
    } catch (e) {
        // silently fail - activity logging should not break main flow
    }
}

module.exports = { logActivity };
