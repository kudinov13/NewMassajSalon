const { getDb } = require("./db");

const TABLE_NAME = "reviews";

const badWords = [
    "хуй", "пизд", "еба", "бля", "сука", "суки", "суку", "мразь", "ублюдок",
    "говно", "дурак", "идиот", "тварь", "шлюха", "проститутка", "пидор", "педик",
    "мудак", "мразь", "гандон", "конч", "долбоёб", "долбоеб", "чмо", "похуй"
];

const containsBadWords = (text) => {
    const lowered = text.toLowerCase();
    return badWords.some((word) => lowered.includes(word));
};

module.exports = {
    TABLE_NAME,
    containsBadWords,
    getApprovedReviews: async () => {
        return await getDb().all(
            `SELECT id, userId, name, rating, text, createdAt FROM ${TABLE_NAME} WHERE status = 'approved' ORDER BY createdAt DESC`
        );
    },
    getReviewByUserId: async (userId) => {
        return await getDb().get(
            `SELECT * FROM ${TABLE_NAME} WHERE userId = ?`,
            userId
        );
    },
    addReview: async (userId, name, rating, text) => {
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} (userId, name, rating, text, status) VALUES (?, ?, ?, ?, 'approved')`,
            userId || null, name, rating, text
        );
        return result.lastID;
    }
};
