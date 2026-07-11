const express = require('express');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');
const diagnosticsTestsDb = require('../db/diagnosticsTests');
const { seedDefaultTests, seedResultsForTest } = require('../db/diagnosticsTestsSeed');

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    req.user = await getUserById(userId);
    next();
};

const requireAdmin = async (req, res, next) => {
    await requireAuth(req, res, () => {
        if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
        next();
    });
};

const router = express.Router();

// Public: get full test by slug (questions + options only, not results)
router.get('/public/:slug', async (req, res) => {
    try {
        const test = await diagnosticsTestsDb.getFullTestBySlug(req.params.slug);
        if (!test) return res.status(404).json({ message: 'Тест не найден' });
        res.json(test);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при получении теста' });
    }
});

// Public: evaluate test result by score
router.post('/public/:slug/evaluate', async (req, res) => {
    try {
        const { score } = req.body;
        if (typeof score !== 'number') {
            return res.status(400).json({ message: 'Укажите score' });
        }
        const test = await diagnosticsTestsDb.getTestBySlug(req.params.slug);
        if (!test) return res.status(404).json({ message: 'Тест не найден' });

        const result = await diagnosticsTestsDb.findResultByScore(test.id, score);
        if (!result) return res.status(404).json({ message: 'Результат не найден' });

        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при оценке результата' });
    }
});

// Admin: create default tests (useful when server was not restarted)
router.post('/seed', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const created = await seedDefaultTests(db);
        res.json({ created });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при создании тестов' });
    }
});

// Admin: reset results of a specific test to default
router.post('/:id/reset-results', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const test = await diagnosticsTestsDb.getTestById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Тест не найден' });

        await seedResultsForTest(db, test.id, test.slug);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при сбросе результатов' });
    }
});

// Admin: list all tests (with basic info)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const tests = await diagnosticsTestsDb.getAllTests();
        res.json(tests);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при получении тестов' });
    }
});

// Admin: create new test
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { slug, title, subtitle, active } = req.body;
        if (!slug || !title) {
            return res.status(400).json({ message: 'Укажите slug и title' });
        }
        const id = await diagnosticsTestsDb.createTest(slug, title, subtitle || '', active ? 1 : 0);
        res.status(201).json({ id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при создании теста' });
    }
});

// Admin: update test
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { slug, title, subtitle, active } = req.body;
        if (!slug || !title) {
            return res.status(400).json({ message: 'Укажите slug и title' });
        }
        await diagnosticsTestsDb.updateTest(req.params.id, { slug, title, subtitle, active: active ? 1 : 0 });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при обновлении теста' });
    }
});

// Admin: delete test
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await diagnosticsTestsDb.deleteTest(req.params.id);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при удалении теста' });
    }
});

// Admin: get full test data (questions, options, results)
router.get('/:id/full', requireAdmin, async (req, res) => {
    try {
        const test = await diagnosticsTestsDb.getTestById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Тест не найден' });

        const questions = await diagnosticsTestsDb.getQuestionsByTestId(test.id);
        const questionsWithOptions = [];
        for (const q of questions) {
            const options = await diagnosticsTestsDb.getOptionsByQuestionId(q.id);
            questionsWithOptions.push({ ...q, options });
        }
        const results = await diagnosticsTestsDb.getResultsByTestId(test.id);

        res.json({ ...test, questions: questionsWithOptions, results });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при получении теста' });
    }
});

// Admin: questions CRUD
router.post('/:testId/questions', requireAdmin, async (req, res) => {
    try {
        const { text, sortOrder } = req.body;
        if (!text) return res.status(400).json({ message: 'Укажите текст вопроса' });
        const id = await diagnosticsTestsDb.createQuestion(req.params.testId, text, sortOrder || 0);
        res.status(201).json({ id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при создании вопроса' });
    }
});

router.put('/questions/:id', requireAdmin, async (req, res) => {
    try {
        const { text, sortOrder } = req.body;
        if (!text) return res.status(400).json({ message: 'Укажите текст вопроса' });
        await diagnosticsTestsDb.updateQuestion(req.params.id, text, sortOrder || 0);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при обновлении вопроса' });
    }
});

router.delete('/questions/:id', requireAdmin, async (req, res) => {
    try {
        await diagnosticsTestsDb.deleteQuestion(req.params.id);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при удалении вопроса' });
    }
});

// Admin: options CRUD
router.post('/questions/:questionId/options', requireAdmin, async (req, res) => {
    try {
        const { text, score, sortOrder } = req.body;
        if (!text || typeof score !== 'number') {
            return res.status(400).json({ message: 'Укажите текст и балл' });
        }
        const id = await diagnosticsTestsDb.createOption(req.params.questionId, text, score, sortOrder || 0);
        res.status(201).json({ id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при создании варианта' });
    }
});

router.put('/options/:id', requireAdmin, async (req, res) => {
    try {
        const { text, score, sortOrder } = req.body;
        if (!text || typeof score !== 'number') {
            return res.status(400).json({ message: 'Укажите текст и балл' });
        }
        await diagnosticsTestsDb.updateOption(req.params.id, text, score, sortOrder || 0);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при обновлении варианта' });
    }
});

router.delete('/options/:id', requireAdmin, async (req, res) => {
    try {
        await diagnosticsTestsDb.deleteOption(req.params.id);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при удалении варианта' });
    }
});

// Admin: results CRUD
router.post('/:testId/results', requireAdmin, async (req, res) => {
    try {
        const { minScore, maxScore, title, text, isSeriousProblem, buttonLabel, buttonLink } = req.body;
        if (typeof minScore !== 'number' || typeof maxScore !== 'number' || !title || !text) {
            return res.status(400).json({ message: 'Укажите диапазон баллов, заголовок и текст' });
        }
        const id = await diagnosticsTestsDb.createResult(
            req.params.testId, minScore, maxScore, title, text, isSeriousProblem, buttonLabel, buttonLink
        );
        res.status(201).json({ id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при создании результата' });
    }
});

router.put('/results/:id', requireAdmin, async (req, res) => {
    try {
        const { minScore, maxScore, title, text, isSeriousProblem, buttonLabel, buttonLink } = req.body;
        if (typeof minScore !== 'number' || typeof maxScore !== 'number' || !title || !text) {
            return res.status(400).json({ message: 'Укажите диапазон баллов, заголовок и текст' });
        }
        await diagnosticsTestsDb.updateResult(req.params.id, {
            minScore, maxScore, title, text, isSeriousProblem, buttonLabel, buttonLink
        });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при обновлении результата' });
    }
});

router.delete('/results/:id', requireAdmin, async (req, res) => {
    try {
        await diagnosticsTestsDb.deleteResult(req.params.id);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при удалении результата' });
    }
});

module.exports = router;
