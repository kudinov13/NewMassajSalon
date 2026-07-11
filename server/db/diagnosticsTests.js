const { getDb } = require("./db");

module.exports = {
    // Tests
    getAllTests: async () => {
        const db = getDb();
        return await db.all(`SELECT * FROM diagnostic_tests ORDER BY slug`);
    },
    getTestBySlug: async (slug) => {
        const db = getDb();
        return await db.get(`SELECT * FROM diagnostic_tests WHERE slug = ?`, slug);
    },
    getTestById: async (id) => {
        const db = getDb();
        return await db.get(`SELECT * FROM diagnostic_tests WHERE id = ?`, id);
    },
    createTest: async (slug, title, subtitle, active = 1) => {
        const db = getDb();
        const result = await db.run(
            `INSERT INTO diagnostic_tests (slug, title, subtitle, active) VALUES (?, ?, ?, ?)`,
            slug, title, subtitle, active
        );
        return result.lastID;
    },
    updateTest: async (id, fields) => {
        const db = getDb();
        const { slug, title, subtitle, active } = fields;
        await db.run(
            `UPDATE diagnostic_tests SET slug = ?, title = ?, subtitle = ?, active = ? WHERE id = ?`,
            slug, title, subtitle, active, id
        );
    },
    deleteTest: async (id) => {
        const db = getDb();
        await db.run(`DELETE FROM diagnostic_tests WHERE id = ?`, id);
    },

    // Questions
    getQuestionsByTestId: async (testId) => {
        const db = getDb();
        return await db.all(
            `SELECT * FROM diagnostic_questions WHERE testId = ? ORDER BY sortOrder, id`,
            testId
        );
    },
    createQuestion: async (testId, text, sortOrder = 0) => {
        const db = getDb();
        const result = await db.run(
            `INSERT INTO diagnostic_questions (testId, text, sortOrder) VALUES (?, ?, ?)`,
            testId, text, sortOrder
        );
        return result.lastID;
    },
    updateQuestion: async (id, text, sortOrder) => {
        const db = getDb();
        await db.run(
            `UPDATE diagnostic_questions SET text = ?, sortOrder = ? WHERE id = ?`,
            text, sortOrder, id
        );
    },
    deleteQuestion: async (id) => {
        const db = getDb();
        await db.run(`DELETE FROM diagnostic_questions WHERE id = ?`, id);
    },

    // Options
    getOptionsByQuestionId: async (questionId) => {
        const db = getDb();
        return await db.all(
            `SELECT * FROM diagnostic_options WHERE questionId = ? ORDER BY sortOrder, id`,
            questionId
        );
    },
    createOption: async (questionId, text, score, sortOrder = 0) => {
        const db = getDb();
        const result = await db.run(
            `INSERT INTO diagnostic_options (questionId, text, score, sortOrder) VALUES (?, ?, ?, ?)`,
            questionId, text, score, sortOrder
        );
        return result.lastID;
    },
    updateOption: async (id, text, score, sortOrder) => {
        const db = getDb();
        await db.run(
            `UPDATE diagnostic_options SET text = ?, score = ?, sortOrder = ? WHERE id = ?`,
            text, score, sortOrder, id
        );
    },
    deleteOption: async (id) => {
        const db = getDb();
        await db.run(`DELETE FROM diagnostic_options WHERE id = ?`, id);
    },

    // Results
    getResultsByTestId: async (testId) => {
        const db = getDb();
        return await db.all(
            `SELECT * FROM diagnostic_results WHERE testId = ? ORDER BY minScore`,
            testId
        );
    },
    findResultByScore: async (testId, score) => {
        const db = getDb();
        return await db.get(
            `SELECT * FROM diagnostic_results WHERE testId = ? AND minScore <= ? AND maxScore >= ? ORDER BY minScore DESC LIMIT 1`,
            testId, score, score
        );
    },
    createResult: async (testId, minScore, maxScore, title, text, isSeriousProblem, buttonLabel, buttonLink) => {
        const db = getDb();
        const result = await db.run(
            `INSERT INTO diagnostic_results (testId, minScore, maxScore, title, text, isSeriousProblem, buttonLabel, buttonLink) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            testId, minScore, maxScore, title, text, isSeriousProblem ? 1 : 0, buttonLabel || null, buttonLink || null
        );
        return result.lastID;
    },
    updateResult: async (id, fields) => {
        const db = getDb();
        const { minScore, maxScore, title, text, isSeriousProblem, buttonLabel, buttonLink } = fields;
        await db.run(
            `UPDATE diagnostic_results SET minScore = ?, maxScore = ?, title = ?, text = ?, isSeriousProblem = ?, buttonLabel = ?, buttonLink = ? WHERE id = ?`,
            minScore, maxScore, title, text, isSeriousProblem ? 1 : 0, buttonLabel || null, buttonLink || null, id
        );
    },
    deleteResult: async (id) => {
        const db = getDb();
        await db.run(`DELETE FROM diagnostic_results WHERE id = ?`, id);
    },

    // Full test data for users
    getFullTestBySlug: async (slug) => {
        const db = getDb();
        const test = await db.get(`SELECT id, slug, title, subtitle FROM diagnostic_tests WHERE slug = ? AND active = 1`, slug);
        if (!test) return null;

        const questions = await db.all(
            `SELECT id, text, sortOrder FROM diagnostic_questions WHERE testId = ? ORDER BY sortOrder, id`,
            test.id
        );

        const questionsWithOptions = [];
        for (const q of questions) {
            const options = await db.all(
                `SELECT id, text, score, sortOrder FROM diagnostic_options WHERE questionId = ? ORDER BY sortOrder, id`,
                q.id
            );
            questionsWithOptions.push({ ...q, options });
        }

        return { ...test, questions: questionsWithOptions };
    },
};
