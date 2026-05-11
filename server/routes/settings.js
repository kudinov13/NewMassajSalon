const express = require('express');
const {getUserIdByToken} = require("../db/tokens");
const {getUserById} = require("../db/users");
const {getAllSettings, setSetting} = require("../db/settings");
const settingsRouter = express.Router();

// публичный GET - все настройки сайта
settingsRouter.get("/", async (req, res) => {
    const settings = await getAllSettings();
    res.status(200).json(settings);
});

// PUT - только для админов
settingsRouter.put("/", async (req, res) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) {
        return res.status(401).json({message: "Пользователь не авторизован"});
    }

    const user = await getUserById(userId);
    if (!user || !user.isAdmin) {
        return res.status(403).json({message: "Доступ запрещён"});
    }

    const updates = req.body || {};
    for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'string') {
            await setSetting(key, value);
        }
    }

    const settings = await getAllSettings();
    res.status(200).json(settings);
});

module.exports = settingsRouter;
