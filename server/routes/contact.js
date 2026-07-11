const express = require('express');
const nodemailer = require('nodemailer');
const { getUserIdByToken } = require("../db/tokens");
const { getUserById } = require("../db/users");
const { addMessage, getAllMessages, getMessageById, updateStatus } = require("../db/contactMessages");

const contactRouter = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.yandex.ru';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

const sendAdminNotification = async ({ name, phone, email, message }) => {
    if (!ADMIN_EMAIL || !SMTP_USER || !SMTP_PASS) {
        console.warn('SMTP not configured, skipping email notification');
        return;
    }

    const mailOptions = {
        from: `"КООСМО" <${SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: 'Обращение в поддержку',
        text: `Email для связи: ${email || 'не указан'}
Телефон: ${phone || 'не указан'}

Текст обращения:
${message}
`,
        html: `<p><b>Email для связи:</b> ${email || 'не указан'}</p>
<p><b>Телефон:</b> ${phone || 'не указан'}</p>
<hr/>
<p><b>Текст обращения:</b></p>
<p style="white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
`,
    };

    await transporter.sendMail(mailOptions);
};

contactRouter.post("/", async (req, res) => {
    try {
        const { name, phone, message } = req.body;

        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({ message: "Укажите ваше имя" });
        }

        if (!message || typeof message !== "string" || message.trim().length < 5) {
            return res.status(400).json({ message: "Сообщение слишком короткое" });
        }

        const token = req.cookies.token;
        const userId = await getUserIdByToken(token);
        let user = null;
        let email = '';
        let contactPhone = phone || '';

        if (userId) {
            user = await getUserById(userId);
            if (user) {
                email = user.email || '';
                contactPhone = phone || user.phone || '';
            }
        }

        const messageId = await addMessage(userId, name.trim(), contactPhone, email, message.trim());

        try {
            await sendAdminNotification({ name: name.trim(), phone: contactPhone, email, message: message.trim() });
        } catch (e) {
            console.error('Failed to send email notification:', e);
        }

        res.status(201).json({ id: messageId, ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка при отправке обращения" });
    }
});

contactRouter.get("/", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdByToken(token);
        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Доступ запрещён" });
        }

        const messages = await getAllMessages();
        res.status(200).json(messages);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка при получении обращений" });
    }
});

contactRouter.put("/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = await getUserIdByToken(token);
        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Доступ запрещён" });
        }

        const { status, adminReply } = req.body;
        const message = await getMessageById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Обращение не найдено" });
        }

        await updateStatus(req.params.id, status || message.status, adminReply);
        res.status(200).json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка при обновлении обращения" });
    }
});

module.exports = contactRouter;
