const express = require('express');
const md5 = require('md5');
const authRouter = express.Router();
const {getUserByLogin} = require("../db/users");
const {addToken, getUserIdByToken, deleteByToken} = require("../db/tokens");

const COOKIE_NAME = "token";

authRouter.post("/", async (req, res) => {

    const user = await getUserByLogin(req.body.login);

    if (!user) {
        return res.status(404).json({
            message: "Такой пользователь не найден"
        });
    }

    if (user.password !== md5(req.body.password)) { // TODO: hash
        return res.status(400).json({
            message: "Пароль неверный"
        });
    }

    const token = await addToken(user.id);
    res.cookie(COOKIE_NAME, token, {
        maxAge: 24 * 60 * 60 * 1000, // TODO: to const
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({ok: true});
});

authRouter.delete("/", async (req, res) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) {
        return res.status(401).json({
            message: "Пользователь не авторизован"
        });
    }

    // delete token from DB
    await deleteByToken(token);

    // delete cookie
    res.clearCookie(COOKIE_NAME);

    res.status(200).json({ok: true});
});

module.exports = authRouter;