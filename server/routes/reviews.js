const express = require('express');
const { getUserIdByToken } = require("../db/tokens");
const { getUserById } = require("../db/users");
const { getApprovedReviews, getReviewByUserId, addReview, containsBadWords } = require("../db/reviews");

const reviewsRouter = express.Router();

const firstNameOnly = (name) => {
    if (!name) return name;
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? parts[1] : parts[0];
};

reviewsRouter.get("/", async (req, res) => {
    try {
        const reviews = await getApprovedReviews();
        res.status(200).json(reviews.map((r) => ({ ...r, name: firstNameOnly(r.name) })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка при получении отзывов" });
    }
});

reviewsRouter.post("/", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdByToken(token);
        if (!userId) {
            return res.status(401).json({ message: "Для оставления отзыва необходимо авторизоваться" });
        }

        const user = await getUserById(userId);
        if (!user) {
            return res.status(401).json({ message: "Пользователь не найден" });
        }

        const existingReview = await getReviewByUserId(userId);
        if (existingReview) {
            return res.status(400).json({ message: "Вы уже оставляли отзыв" });
        }

        const { rating, text } = req.body;
        const ratingNum = Number(rating);

        if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: "Укажите рейтинг от 1 до 5" });
        }

        if (!text || typeof text !== "string" || text.trim().length < 5) {
            return res.status(400).json({ message: "Отзыв должен содержать минимум 5 символов" });
        }

        const cleanText = text.trim();

        if (containsBadWords(cleanText)) {
            return res.status(400).json({ message: "Отзыв содержит нецензурную лексику и не может быть опубликован" });
        }

        const fullName = user.fullName?.trim();
        const fullNameParts = fullName ? fullName.split(/\s+/) : [];
        const name = fullNameParts.length >= 2 ? fullNameParts[1] : (fullNameParts[0] || user.login);
        const reviewId = await addReview(userId, name, ratingNum, cleanText);

        res.status(201).json({
            id: reviewId,
            name,
            rating: ratingNum,
            text: cleanText,
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка при сохранении отзыва" });
    }
});

module.exports = reviewsRouter;
